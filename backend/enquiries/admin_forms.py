from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from .models import Enquiry


class SuperadminRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    bootstrap_token = forms.CharField(label="Bootstrap token", widget=forms.PasswordInput(attrs={"autocomplete": "off"}))

    class Meta(UserCreationForm.Meta):
        model = get_user_model()
        fields = ("username", "email")


class EnquiryStatusForm(forms.ModelForm):
    class Meta:
        model = Enquiry
        fields = ("status",)
