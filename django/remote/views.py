from django.shortcuts import render

# Create your views here.
def remote(request):
	return render(request, "remote.html")
