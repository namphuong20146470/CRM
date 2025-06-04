export const resetFilters = (setters) => {
    setters.forEach((setter) => setter('all'));
};