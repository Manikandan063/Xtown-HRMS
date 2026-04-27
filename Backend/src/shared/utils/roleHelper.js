/**
 * Helper to normalize role names and check for SuperAdmin status
 */
export const getNormalizedRole = (role) => {
  return String(role || "").toLowerCase().replace(/[^a-z0-9]/g, "");
};

export const isSuperAdmin = (role) => {
  return getNormalizedRole(role) === "superadmin";
};

/**
 * Builds a Sequelize 'where' filter that includes companyId 
 * ONLY IF the user is not a SuperAdmin.
 */
export const getCompanyFilter = (user, existingFilter = {}) => {
  const filter = { ...existingFilter };
  
  if (!isSuperAdmin(user?.role)) {
    filter.companyId = user.companyId;
  }
  
  return filter;
};
