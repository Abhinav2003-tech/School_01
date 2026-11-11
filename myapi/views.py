from django.http import JsonResponse
from django.shortcuts import render
from students.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from students.models import *

# Create your views here.

@csrf_exempt
def registerview(request):
    if request.method == 'POST':
        firstname = request.POST.get('firstname')
        lastname = request.POST.get('lastname')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone_number')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        role = request.POST.get('role')
        print(firstname, lastname, email, phone_number, password, confirm_password, role)
        if not (firstname and lastname and email and phone_number and password and role):
            print("Please fill in all required fields")
            return JsonResponse({
                "status":False,
                "message":"Please fill in all required fields"
                
            })
            # return redirect('admin_login_page')
        if password != confirm_password:
            print("Password and confirm password do not match")
            return JsonResponse({
                "status" : False,
                "message" : "Password and confirm password do not match"
            })
            # return redirect('admin_login_page')

        createuser = User.objects.create_user(firstname=firstname, lastname=lastname, email=email, phone_number=phone_number, password=password, role=role, username=email)
        return JsonResponse({
            "status" : True,
            "message" : "Registration Successfull",
            "user_Id" : createuser.id,
            "user_name" : createuser.firstname,
        })
    return JsonResponse({
            "status" : True,
            "message" : "Invalid Method.",
        })

@csrf_exempt
def loginview(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        print("This view is working")
        if not email or not password:
            return JsonResponse({
                "status" : False,
                "message" : "Please enter email and password.",
            })

        # Authenticate user
        user = authenticate(request, username=email, password=password)

        if user is None:
            return JsonResponse({
                "status" : False,
                "message" : "Invalid email or password.",
            })

        # Login user
        # login(request, user)

        return JsonResponse({
            "status" : True,
            "message" : "Login Successful",
            "user_Id" : user.id,
            "user_Name" : user.email,

        })

    return JsonResponse({
        "status" : False,
        "message" : "Invalid Method"
    })
        # return redirect('admin_login_page')

@csrf_exempt
def querryview(request):
    if request.method == 'POST':
        print("This function is working ")
        Name = request.POST.get('name')
        Email = request.POST.get('email')
        Subject = request.POST.get('subject')
        Message = request.POST.get('message')

        print(Name, Email, Subject, Email)

        if not (Name and Email and Subject and Message):
                print("please fill in all required fields") 
                return JsonResponse({
                    "status" : False,
                    "message" : "Please fill in all required fields",
                })
        createQuerry = enquiry.objects.create(name = Name, email = Email, subject = Subject, message = Message)
        return JsonResponse({
            "status" : True,
            "message" : "Querry saved Successfully.",
            "User _Id" : createQuerry.id,
            "Name" : createQuerry.name,
            "Email" : createQuerry.email,
            "Subject" : createQuerry.subject,
            "Message" : createQuerry.message,
        })
    return JsonResponse({
        "status" : False,
        "message" : "Invalid Method",
    })
@csrf_exempt
def QuerryListView(request):
    if request.method == 'GET':
        querries = enquiry.objects.all()
        querry_list = []
        for querry in querries:
            querry_list.append({
                "id" : querry.id,
                "name" : querry.name,
                "email" : querry.email,
                "subject" : querry.subject,
                "message" : querry.message,
            })
        return JsonResponse({
            "status" : True,
            "message" : "Querry List",
            "querries" : querry_list
        })
    return JsonResponse({
        "status" : False,
        "message" : "Invalid Method", 
    })

@csrf_exempt
def DeleteQuerry(request, querry_id):
    if request.method == 'DELETE':
        try:
            querry = enquiry.objects.get(id = querry_id)
            querry.delete()
            return JsonResponse({
                "status" : True,
                "message" : "Querry deleted successfully."
            })
        except enquiry.DoesNotExist:
            return JsonResponse({
                "status" : False,
                "message" : "Querry not found."
            })

@csrf_exempt
def EditQuerry(request, querry_id):
    if request.method == 'POST':
        try:
            Querry = enquiry.objects.get(id = querry_id)
            Name = request.POST.get('name')
            Email = request.POST.get('email')
            Subject = request.POST.get('subject')
            Message = request.POST.get('message')

            print(Name, Email, Subject, Message)
            if Name:
                Querry.name = Name
            if Email:
                Querry.email = Email
            if Subject:
                Querry.subject = Subject
            if Message:
                Querry.message = Message
            Querry.save()
            return JsonResponse({
                "status" : True,
                "message" : "Querry updated successfully.",
                "querry" : {
                    "id" : Querry.id,
                    "name" : Name if Name else Querry.name,
                    "email" : Email if Email else Querry.email,
                    "subject" : Subject if Subject else Querry.subject,
                    "message" : Message if Message else Querry.message,
                }
            })
        except enquiry.DoesNotExist:
            return JsonResponse({
                "status" : False,
                "message" : "Querry not found."
            })