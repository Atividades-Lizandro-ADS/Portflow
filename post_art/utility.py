
def get_object_or_none(classModel,**kwargs):
    '''
    classModel: classe Model,
    passar para kwargs a validação que se deseja, por exemplo id=obj.id
    '''

    try:
        return classModel.objects.get(**kwargs),True
    except classModel.DoesNotExist:
        return None,False
    