const INITIAL_STATE = {
  crewmemberList: [],
  error: null,
  fetching: false,
  fetched: false
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'GET_CREWMEMBERS_PENDING':
    case 'ADD_CREWMEMBER_PENDING':
    case 'SAVE_CREWMEMBER_PENDING':
    case 'DELETE_CREWMEMBER_PENDING':
      return { ...state, error: null, fetching: true, fetched: false }
    case 'GET_CREWMEMBERS_FULFILLED':
    case 'ADD_CREWMEMBER_FULFILLED':
    case 'SAVE_CREWMEMBER_FULFILLED':
    case 'DELETE_CREWMEMBER_FULFILLED':
      return { ...state, crewmemberList: action.payload, error: null, fetching: false, fetched: true }
    case 'GET_CREWMEMBERS_REJECTED':
    case 'ADD_CREWMEMBER_REJECTED':
    case 'SAVE_CREWMEMBER_REJECTED':
    case 'DELETE_CREWMEMBER_REJECTED':
      return { ...state, crewmemberList: [], error: action.payload, fetching: false, fetched: true }
    default:
      return state
  }
}
