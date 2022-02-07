const INITIAL_STATE = {
  shipList: [],
  count: 0,
  error: null,
  fetching: false,
  fetched: false
}

export default function reducer (state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'GET_SHIPS_PENDING':
    case 'ADD_SHIP_PENDING':
    case 'SAVE_SHIP_PENDING':
    case 'DELETE_SHIP_PENDING':
      return { ...state, error: null, fetching: true, fetched: false }
    case 'GET_SHIPS_FULFILLED':
    case 'ADD_SHIP_FULFILLED':
    case 'SAVE_SHIP_FULFILLED':
    case 'DELETE_SHIP_FULFILLED':
      return { ...state, shipList: action.payload.records, count: action.payload.count, error: null, fetching: false, fetched: true }
    case 'GET_SHIPS_REJECTED':
    case 'ADD_SHIP_REJECTED':
    case 'SAVE_SHIP_REJECTED':
    case 'DELETE_SHIP_REJECTED':
      return { ...state, shipList: [], error: action.payload, fetching: false, fetched: true }
    default:
      return state
  }
}
