import { SERVER } from '../config/global'

// MAIN ENTITY

export const getShips = (filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'GET_SHIPS',
    payload: async () => {
      const response = await fetch(`${SERVER}/ships?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const addShip = (ship, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'ADD_SHIP',
    payload: async () => {
      let response = await fetch(`${SERVER}/ships`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ship)
      })
      response = await fetch(`${SERVER}/ships?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const saveShip = (id, ship, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'SAVE_SHIP',
    payload: async () => {
      let response = await fetch(`${SERVER}/ships/${id}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ship)
      })
      response = await fetch(`${SERVER}/ships?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const deleteShip = (id, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'DELETE_SHIP',
    payload: async () => {
      let response = await fetch(`${SERVER}/ships/${id}`, {
        method: 'delete'
      })
      response = await fetch(`${SERVER}/ships?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

// SECOND ENTITY

export const getCrewmembers = (id) => {
  return {
    type: 'GET_CREWMEMBERS',
    payload: async () => {
      const response = await fetch(`${SERVER}/ships/${id}/crewmembers`)
      const data = await response.json()
      return data
    }
  }
}

export const addCrewmember = (id, chapter, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'ADD_CREWMEMBER',
    payload: async () => {
      let response = await fetch(`${SERVER}/ships/${id}/crewmembers`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chapter)
      })
      response = await fetch(`${SERVER}/ships?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const saveCrewmember = (sid, cid, crewmember, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'SAVE_CREWMEMBER',
    payload: async () => {
      let response = await fetch(`${SERVER}/ships/${sid}/crewmembers/${cid}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(crewmember)
      })
      response = await fetch(`${SERVER}/ships?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const deleteCrewmember = (sid, cid, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'DELETE_CREWMEMBER',
    payload: async () => {
      let response = await fetch(`${SERVER}/ships/${sid}/crewmembers/${cid}`, {
        method: 'delete'
      })
      response = await fetch(`${SERVER}/ships?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}