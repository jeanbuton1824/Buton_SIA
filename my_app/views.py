from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404

from .forms import ProductForm, RegistrationForm
from .models import Product


# =========================
# Dashboard
# =========================
@login_required
def dashboard(request):
    products = Product.objects.all()

    context = {
        "products": products,
        "total_products": products.count(),
        "in_stock_count": products.filter(
            stock_quantity__gt=0
        ).count(),
        "low_stock_count": products.filter(
            stock_quantity__gt=0,
            stock_quantity__lte=5
        ).count(),
        "out_of_stock_count": products.filter(
            stock_quantity=0
        ).count(),
    }

    return render(
        request,
        "my_app/dashboard.html",
        context
    )


# =========================
# Products
# =========================
@login_required
def product_list(request):
    products = Product.objects.all()

    context = {
        "products": products,
        "total_products": products.count(),
        "in_stock_count": products.filter(
            stock_quantity__gt=5
        ).count(),
        "low_stock_count": products.filter(
            stock_quantity__gt=0,
            stock_quantity__lte=5
        ).count(),
        "out_of_stock_count": products.filter(
            stock_quantity=0
        ).count(),
    }

    return render(
        request,
        "my_app/product_list.html",
        context
    )


# =========================
# Add Product
# =========================
@login_required
def product_add(request):
    if request.method == "POST":
        form = ProductForm(request.POST, request.FILES)

        if form.is_valid():
            form.save()
            return redirect("product_list")

    else:
        form = ProductForm()

    return render(
        request,
        "my_app/product_form.html",
        {"form": form}
    )


# =========================
# Edit Product
# =========================
@login_required
def product_edit(request, product_id):
    product = get_object_or_404(
        Product,
        product_id=product_id
    )

    if request.method == "POST":
        form = ProductForm(
            request.POST,
            request.FILES,
            instance=product,
        )

        if form.is_valid():
            form.save()
            return redirect("product_list")

    else:
        form = ProductForm(
            instance=product
        )

    return render(
        request,
        "my_app/product_form.html",
        {
            "form": form,
            "product": product
        }
    )


# =========================
# Delete Product
# =========================
@login_required
def product_delete(request, product_id):
    product = get_object_or_404(
        Product,
        product_id=product_id
    )

    if request.method == "POST":
        product.delete()
        return redirect("product_list")

    return render(
        request,
        "my_app/product_confirm_delete.html",
        {
            "product": product
        }
    )


# =========================
# Orders
# =========================
@login_required
def orders(request):
    return render(
        request,
        "my_app/orders.html"
    )


# =========================
# Customers
# =========================
@login_required
def customers(request):
    return render(
        request,
        "my_app/customers.html"
    )


# =========================
# Categories
# =========================
@login_required
def categories(request):
    return render(
        request,
        "my_app/categories.html"
    )


# =========================
# Reports
# =========================
@login_required
def reports(request):
    products = Product.objects.all()

    context = {
        "products": products,
        "total_products": products.count(),
        "in_stock_count": products.filter(
            stock_quantity__gt=0
        ).count(),
        "low_stock_count": products.filter(
            stock_quantity__gt=0,
            stock_quantity__lte=5
        ).count(),
        "out_of_stock_count": products.filter(
            stock_quantity=0
        ).count(),
    }

    return render(
        request,
        "my_app/reports.html",
        context
    )


# =========================
# Settings
# =========================
@login_required
def settings(request):
    return render(
        request,
        "my_app/settings.html"
    )


def register(request):
    if request.user.is_authenticated:
        return redirect("dashboard")

    if request.method == "POST":
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("dashboard")
    else:
        form = RegistrationForm()

    return render(request, "my_app/register.html", {"form": form})