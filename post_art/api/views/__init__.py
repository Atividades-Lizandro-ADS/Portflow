from .auth import RegisterView, LoginView, LogoutView
from .post import PostListCreateView, PostRetrieveUpdateDestroyView, PostsArtViewRefresh
from .profile import ProfileView, AboutUpdateView
from .social import CommentCreateView, CommentDestroyView, LikeView, FavoriteView
from .media import PostImageView
from .programs import UsedProgramsView, RemoveUsedPrograms, RemoveUsedProgramsAbout

__all__ = [
    'RegisterView', 'LoginView', 'LogoutView',
    'PostListCreateView', 'PostRetrieveUpdateDestroyView', 'PostsArtViewRefresh',
    'ProfileView', 'AboutUpdateView',
    'CommentCreateView', 'CommentDestroyView', 'LikeView', 'FavoriteView',
    'PostImageView',
    'UsedProgramsView', 'RemoveUsedPrograms', 'RemoveUsedProgramsAbout',
]
