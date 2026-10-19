from io import BytesIO
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.test.utils import override_settings
from django.urls import reverse
from PIL import Image

from .models import Product


class AuthenticationTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="glow-owner",
            email="owner@example.com",
            password="Unique-Pass-847!",
        )

    def test_dashboard_redirects_anonymous_visitors_to_login(self):
        response = self.client.get(reverse("dashboard"))

        self.assertRedirects(
            response,
            f"{reverse('login')}?next={reverse('dashboard')}",
        )

    def test_login_authenticates_and_redirects_to_dashboard(self):
        response = self.client.post(
            reverse("login"),
            {"username": "glow-owner", "password": "Unique-Pass-847!"},
        )

        self.assertRedirects(response, reverse("dashboard"))
        self.assertEqual(int(self.client.session["_auth_user_id"]), self.user.pk)

    def test_invalid_login_shows_an_error(self):
        response = self.client.post(
            reverse("login"),
            {"username": "glow-owner", "password": "incorrect"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Please enter a correct username and password.")

    def test_registration_creates_user_and_signs_them_in(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "new-glow-owner",
                "email": "new-owner@example.com",
                "password1": "Rose-Petal-Pass-827!",
                "password2": "Rose-Petal-Pass-827!",
            },
        )

        self.assertRedirects(response, reverse("dashboard"))
        user = get_user_model().objects.get(username="new-glow-owner")
        self.assertEqual(user.email, "new-owner@example.com")
        self.assertTrue(user.check_password("Rose-Petal-Pass-827!"))
        self.assertEqual(int(self.client.session["_auth_user_id"]), user.pk)

    def test_registration_rejects_duplicate_email(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "another-glow-owner",
                "email": "OWNER@example.com",
                "password1": "Rose-Petal-Pass-827!",
                "password2": "Rose-Petal-Pass-827!",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(
            get_user_model().objects.filter(username="another-glow-owner").exists()
        )

    def test_logout_uses_post_and_returns_to_login(self):
        self.client.force_login(self.user)

        response = self.client.post(reverse("logout"))

        self.assertRedirects(response, reverse("login"))
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_signed_in_pages_render(self):
        self.client.force_login(self.user)

        for name in (
            "dashboard",
            "product_list",
            "product_add",
            "orders",
            "customers",
            "categories",
            "reports",
            "settings",
        ):
            with self.subTest(page=name):
                response = self.client.get(reverse(name))
                self.assertEqual(response.status_code, 200)


class ProductImageTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="product-owner",
            password="Unique-Pass-847!",
        )
        self.client.force_login(self.user)
        self.media_directory = tempfile.TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.media_directory.name)
        self.settings_override.enable()
        self.addCleanup(self.settings_override.disable)
        self.addCleanup(self.media_directory.cleanup)

    def make_png(self):
        image = Image.new("RGB", (2, 2), color="pink")
        content = BytesIO()
        image.save(content, format="PNG")
        return SimpleUploadedFile("lipstick.png", content.getvalue(), content_type="image/png")

    def product_data(self):
        return {
            "name": "Rose Lipstick",
            "sku": "ROSE-001",
            "price": "12.50",
            "supplier": "Beauty Supply",
            "category": "Lips",
            "brand": "Glow",
            "stock_quantity": "8",
            "description": "A soft rose shade.",
        }

    def test_product_photo_upload_shows_next_to_product_name(self):
        response = self.client.post(
            reverse("product_add"),
            {**self.product_data(), "image": self.make_png()},
        )

        self.assertRedirects(response, reverse("product_list"))
        response = self.client.get(reverse("product_list"))
        saved_product = Product.objects.get(sku="ROSE-001")
        self.assertTrue(saved_product.image.name.startswith("products/"))
        self.assertTrue(saved_product.image.storage.exists(saved_product.image.name))
        self.assertContains(response, 'class="product-thumb"')
        self.assertContains(response, saved_product.image.url)
        self.assertContains(response, 'alt="Rose Lipstick"')
        self.assertContains(response, "Rose Lipstick")
        with saved_product.image.open("rb") as image_file:
            self.assertTrue(image_file.read().startswith(b"\x89PNG"))

    def test_product_photo_is_optional(self):
        response = self.client.post(reverse("product_add"), self.product_data())

        self.assertRedirects(response, reverse("product_list"))
        response = self.client.get(reverse("product_list"))
        self.assertContains(response, "product-thumb-placeholder")

    def test_non_image_upload_is_rejected(self):
        response = self.client.post(
            reverse("product_add"),
            {
                **self.product_data(),
                "image": SimpleUploadedFile(
                    "not-an-image.png",
                    b"this is not an image",
                    content_type="image/png",
                ),
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Product.objects.filter(sku="ROSE-001").exists())
