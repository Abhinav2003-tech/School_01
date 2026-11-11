from django.urls import path
from .views import *
urlpatterns = [
    path('Registration/', registerview, name = "Registration"),
    path('Login/', loginview, name="Login"),
    path('Querry/', querryview, name="Querry"),
    path('Querry_View/', QuerryListView, name = "Enquiry_List_View"),
    path('Querry_Delete/<int:querry_id>', DeleteQuerry, name = "Querry_Delete"),
    path('Querry_Edit/<int:querry_id>', EditQuerry, name = "Querry_edit"),
]