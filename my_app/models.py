from django.db import models

class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    stock_quantity = models.IntegerField(default=0)
    description = models.TextField()
    image = models.ImageField(upload_to="products/", blank=True)
    date_added = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name