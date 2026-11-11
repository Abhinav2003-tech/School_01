from django.db import models

# Create your models here.
from django.conf import settings
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Roles
    ADMIN = "Super Admin"
    STUDENT = "Student"
    TEACHER = "Teacher"
    ROLE_CHOICES = (
        (ADMIN, "Super Admin"),
        (STUDENT, "Student"),
        (TEACHER, "Teacher"),
    )
    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    password = models.CharField(max_length=255)
    #confirm_password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES,null=True, blank=True)


class student_info(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date_of_birth = models.DateField(max_length=10)
    gender = models.CharField(max_length=10)
    blood_group = models.CharField(max_length=5)
    applying_for_class = models.CharField(max_length=255)
    academic_year = models.CharField(max_length=255)
    previous_school = models.CharField(max_length=255)
    previous_class = models.CharField(max_length=255)
    father_name = models.CharField(max_length=255)
    mother_name = models.CharField(max_length=255)
    guardian_name = models.CharField(max_length=255)
    relationship_with_student = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20)
    email = models.EmailField(max_length=255)
    full_address = models.TextField()
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    pincode = models.CharField(max_length=10)
    nationality = models.CharField(max_length=255)
    any_disabilities = models.CharField(max_length=255, blank=True)
    any_special_information = models.TextField(blank=True)


class courses(models.Model):
    course_name = models.CharField(max_length=255)
    course_fee = models.DecimalField(max_digits=10, decimal_places=2)

class adm_registration(models.Model):
    # user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    STATUS_CHOICE = [ 
        ("pending", "Pending"),
        ("reject", "Rejected"),
        ("approved", "Approved")
    ]
    firstname = models.CharField(max_length=255)
    middlename = models.CharField(max_length=255, blank=True)
    lastname = models.CharField(max_length=255)
    date_of_birth = models.DateField(max_length=10)
    gender = models.CharField(max_length=10)
    blood_group = models.CharField(max_length=5)
    applying_for_class = models.CharField(max_length=255)
    academic_year = models.CharField(max_length=255)
    previous_school = models.CharField(max_length=255)
    previous_class = models.CharField(max_length=255)
    father_name = models.CharField(max_length=255)
    mother_name = models.CharField(max_length=255)
    guardian_name = models.CharField(max_length=255)
    relationship_with_student = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20)
    email = models.EmailField(max_length=255)
    full_address = models.TextField()
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    pincode = models.CharField(max_length=10)
    nationality = models.CharField(max_length=255)
    religion = models.CharField(max_length=255)
    any_disabilities = models.CharField(max_length=255, blank=True)
    any_special_information = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICE, default="pending")

class enquiry(models.Model):
    name = models.CharField(max_length=20)
    email = models.CharField(max_length=30)
    subject = models.CharField(max_length=50)
    message = models.CharField(max_length=200)
    date = models.DateTimeField(auto_now_add = True, null=True, blank=True)
