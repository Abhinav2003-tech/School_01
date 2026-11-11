from django.shortcuts import render, redirect

from students.models import User
from .models import *
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.dateparse import parse_date
from django.utils.formats import date_format

EDITABLE_FIELDS = [
    "firstname", "middlename", "lastname", "date_of_birth", "gender", "blood_group",
    "applying_for_class", "academic_year", "previous_school", "previous_class",
    "father_name", "mother_name", "guardian_name", "relationship_with_student",
    "mobile_number", "email", "full_address", "city", "state", "pincode",
    "nationality", "religion", "any_disabilities", "any_special_information",
]
REQUIRED_FIELDS = [
    "firstname", "lastname", "date_of_birth", "applying_for_class",
    "academic_year", "mobile_number", "email",
]

# Create your views here.


#view for user register

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
            return redirect('admin_login_page')
        if password != confirm_password:
            print("Password and confirm password do not match")
            return redirect('admin_login_page')
        createuser = User.objects.create_user(firstname=firstname, lastname=lastname, email=email, phone_number=phone_number, password=password, role=role, username=email)
        return redirect('admin_login_page')

@csrf_exempt
def loginview(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        if not email or not password:
            messages.error(request, "Please enter email and password.")
            return redirect('admin_login_page')

        # Authenticate user
        user = authenticate(request, username=email, password=password)

        if user is None:
            messages.error(request, "Invalid email or password.")
            return redirect('admin_login_page')

        # Login user
        login(request, user)

        return redirect('admin_dashboard_page')

    return redirect('admin_login_page')

def logoutview(request):
    print("This function is working")
    logout(request)
    return redirect("admin_login_page")

def admission_registration_view(request):
    if request.method == 'POST':
        firstname = request.POST.get('firstname')
        middlename = request.POST.get('middlename')
        lastname = request.POST.get('lastname')
        date_of_birth = request.POST.get('date_of_birth')
        gender = request.POST.get('gender')
        blood_group = request.POST.get('blood_group')
        applying_for_class = request.POST.get('applying_for_class')
        academic_year = request.POST.get('academic_year')
        previous_school = request.POST.get('previous_school')
        father_name = request.POST.get('father_name')
        mother_name = request.POST.get('mother_name')
        guardian_name = request.POST.get('guardian_name')
        relationship_with_student = request.POST.get('relationship_with_student')
        mobile_number = request.POST.get('mobile_number')
        email = request.POST.get('email')
        full_address = request.POST.get('full_address')
        city = request.POST.get('city')
        state = request.POST.get('state')
        pincode = request.POST.get('pincode')
        nationality = request.POST.get('nationality')
        religion = request.POST.get('religion')
        any_disabilities = request.POST.get('any_disabilities')
        any_special_information = request.POST.get('any_special_information')
        if not (firstname and lastname and email and mobile_number and applying_for_class and academic_year):
            print("please fill in all required fields") 
            return redirect('admission_form_page')

        createstudent = adm_registration.objects.create(firstname = firstname, middlename = middlename, lastname = lastname, date_of_birth = date_of_birth, gender = gender, blood_group = blood_group, applying_for_class = applying_for_class, academic_year = academic_year, previous_school = previous_school, father_name = father_name, mother_name = mother_name, guardian_name = guardian_name, relationship_with_student = relationship_with_student, mobile_number = mobile_number, email = email, full_address = full_address, city = city, state = state, pincode = pincode, nationality = nationality, religion = religion, any_disabilities = any_disabilities, any_special_information = any_special_information)

        messages.success(request, 'Admission registration successful')
        return redirect('admission_form_page')
        

def indexview(request):
    return render(request,'index.html')

def aboutview(request):
    return render(request,'aboutUs.html')

def academicview(request):
    return render(request,'academics.html')

def admissionview(request):
    return render(request,'admission.html')

def facilitiesview(request):
    return render(request,'facilities.html')

def galleryview(request):
    return render(request,'gallery.html')

def contactview(request):
    return render(request,'contacts.html')

def adminloginview(request):
    return render(request,'adminLogin.html')

def adminregview(request):
    return render(request,'register.html')

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
                return redirect('admission_form_page')

        createQuerry = enquiry.objects.create(name = Name, email = Email, subject = Subject, message = Message)
        messages.success(request, "Querry saved Successfully")
        return render(request,'querry.html')
    return render(request,'querry.html')

def adminEnquiriesview(request):
    enquiries_data = enquiry.objects.all()
    return render(request, 'admin_Enquiries.html', {'enquiries_data': enquiries_data})




def admissionformview(request):
    return render(request,'admission_reg.html')

def dashboardview(request):
    return render(request,'dashboard.html')

def adminDashboardview(request):
    return render(request,'admin_Dashboard.html')

def update_application(request):
    try:
        application = adm_registration.objects.get(id=request.POST.get("application_id"))
    except (adm_registration.DoesNotExist, ValueError, TypeError):
        return JsonResponse({"ok": False, "error": "Application not found."}, status=404)

    data = {f: (request.POST.get(f) or "").strip() for f in EDITABLE_FIELDS}

    if any(not data[f] for f in REQUIRED_FIELDS):
        return JsonResponse({"ok": False, "error": "Please fill in all required fields."}, status=400)

    try:
        validate_email(data["email"])
    except ValidationError:
        return JsonResponse({"ok": False, "error": "Enter a valid email address."}, status=400)

    try:
        dob = parse_date(data["date_of_birth"])
    except ValueError:
        dob = None
    if dob is None:
        return JsonResponse({"ok": False, "error": "Enter a valid date of birth."}, status=400)
    data["date_of_birth"] = dob

    for field, value in data.items():
        setattr(application, field, value)
    application.save()

    return JsonResponse({
        "ok": True,
        "data": {f: str(getattr(application, f)) for f in EDITABLE_FIELDS},
        "dob_display": date_format(application.date_of_birth),
    })


def adminAdmissionview(request):
    if request.method == "POST":
        # edit-details request
        if request.POST.get("action") == "update":
            return update_application(request)

        # status change request (approve / reject)
        application_id = request.POST.get("application_id")
        status = request.POST.get("status")
        valid_statuses = ["pending", "approved", "reject"]
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"

        if not application_id or status not in valid_statuses:
            if is_ajax:
                return JsonResponse({"ok": False, "error": "Invalid data"}, status=400)
            messages.error(request, "Invalid application ID or status.")
            return redirect("admin_admission_page")

        try:
            application = adm_registration.objects.get(id=application_id)
        except adm_registration.DoesNotExist:
            if is_ajax:
                return JsonResponse({"ok": False, "error": "Not found"}, status=404)
            messages.error(request, "Admission application not found.")
            return redirect("admin_admission_page")

        application.status = status
        application.save(update_fields=["status"])

        if is_ajax:
            return JsonResponse({"ok": True, "status": status, "label": application.get_status_display()})
        messages.success(request, f"Application #{application.id} updated.")
        return redirect("admin_admission_page")

    studentRegister = adm_registration.objects.all().order_by("id")
    return render(request, "admin_Admission.html", {"student_data": studentRegister})

     




def adminStudentsview(request):
    return render(request, 'admin_Students.html')


def adminSettingsview(request):

    if request.method =='POST':
        user_is = User.objects.get(id = request.user.id)
        if request.POST.get("Ph_No"):
            user_is.phone_number = request.POST.get("Ph_No")
            user_is.save()
            
        user_is = User.objects.get(id = request.user.id)
        if request.POST.get("Email"):
            user_is.email = request.POST.get("Email")
            user_is.save()
        messages.success(request, "Profile was updated successfully")
        return redirect('admin_settings_page')

        
        
    user_is = User.objects.get(id=request.user.id)

    context = {
        'user_is': user_is,
    }

    return render(request, 'admin_Settings.html', context)


def remove_student_list(request, stud_id):
    stud_is = adm_registration.objects.filter(id = stud_id).first()
    if not stud_is:
        messages.error(request, "No data found")
        return redirect("admin_admission_page")
    stud_is.delete()
    messages.success(request, "Data delete successfully")
    return redirect("admin_admission_page")
