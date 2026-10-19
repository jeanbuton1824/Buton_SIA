from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from .models import Product


class RegistrationForm(UserCreationForm):
    email = forms.EmailField()

    class Meta(UserCreationForm.Meta):
        model = get_user_model()
        fields = ("username", "email")

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if get_user_model().objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("An account with this email already exists.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user


class ProductForm(forms.ModelForm):

    class Meta:
        model = Product

        fields = [
            'name',
            'sku',
            'price',
            'supplier',
            'category',
            'brand',
            'stock_quantity',
            'description',
            'image',
        ]

        widgets = {

            'name': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'Enter product name'
            }),

            'sku': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'Enter SKU'
            }),

            'price': forms.NumberInput(attrs={
                'class': 'form-input',
                'placeholder': 'Enter price',
                'step': '0.01'
            }),

            'supplier': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'Enter supplier'
            }),

            'category': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'Enter category'
            }),

            'brand': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'Enter brand'
            }),

            'stock_quantity': forms.NumberInput(attrs={
                'class': 'form-input',
                'placeholder': 'Enter stock quantity'
            }),

            'description': forms.Textarea(attrs={
                'class': 'form-input',
                'placeholder': 'Enter product description',
                'rows': 5
            }),

            'image': forms.ClearableFileInput(attrs={
                'class': 'form-input',
                'accept': 'image/*',
            }),
        }