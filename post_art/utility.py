from django.shortcuts import HttpResponseRedirect
from django.urls import reverse

def get_object_or_none(classModel,**kwargs):
    '''
    classModel: classe Model,
    passar para kwargs a validação que se deseja, por exemplo id=obj.id
    '''

    try:
        return classModel.objects.get(**kwargs),True
    except classModel.DoesNotExist:
        return None,False
    
def owned_by_request(request,obj_profile,redirect_name='index'):
    if request.user.profile==obj_profile:
        
        return True
    return HttpResponseRedirect(reverse(redirect_name))