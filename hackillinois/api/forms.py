# forms.py
from django import forms

class GitHubURLForm(forms.Form):
    github_url = forms.URLField()
    coding_language = forms.CharField()
    language_version = forms.CharField()
