import { combineReducers } from 'redux'
import ship from './ship-reducer'
import crewmember from './crewmember-reducer'

export default combineReducers({
  crewmember, ship
})
