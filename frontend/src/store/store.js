const state = {
    user: {}
  };
  
  const mutations = {
    UPDATE_USER_DATA(state, userData) {
      state.user = userData;
    }
  };
  
  export default {
    state,
    mutations
  };
  