from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path("login/", auth_views.LoginView.as_view(
        template_name="my_app/login.html",
        redirect_authenticated_user=True,
    ), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    path("register/", views.register, name="register"),
    path("", views.dashboard, name="dashboard"),

    # Products
    path("products/", views.product_list, name="product_list"),
    path("products/add/", views.product_add, name="product_add"),
    path("products/edit/<int:product_id>/", views.product_edit, name="product_edit"),
    path("products/delete/<int:product_id>/", views.product_delete, name="product_delete"),

    # Sidebar pages
    path("orders/", views.orders, name="orders"),
    path("customers/", views.customers, name="customers"),
    path("categories/", views.categories, name="categories"),
    path("reports/", views.reports, name="reports"),
    path("settings/", views.settings, name="settings"),
]