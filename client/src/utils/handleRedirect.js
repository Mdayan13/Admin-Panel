const handleRedirect = (user) => {
  if (user) {
    if (user.isAdmin) {
      return "/admin/dashboard";
    } else {
      return "/dashboard";
    }
  } else {
    return "/";
  }
};