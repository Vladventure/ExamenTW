import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'

import { getShips, addShip, saveShip, deleteShip, getCrewmembers, addCrewmember, saveCrewmember, deleteCrewmember } from '../actions'

const shipSelector = state => state.ship.shipList
const shipCountSelector = state => state.ship.count
const crewmemberSelector = state => state.crewmember.crewmemberList

function ShipList() {
  const [isCrewmemberDialogShown, setIsCrewmemberDialogShown] = useState(false)
  const [isShipDialogShown, setIsShipDialogShown] = useState(false)
  const [isChildrenDialogShown, setIsChildrenDialogShown] = useState(false)

  const [name, setName] = useState('')
  const [displacement, setDisplacement] = useState(51)
  const [role, setRole] = useState('')

  const [isNewRecord, setIsNewRecord] = useState(true)
  const [selectedShip, setSelectedShip] = useState(null)
  const [selectedCrewmember, setSelectedCrewmember] = useState(null)
  const [filterString, setFilterString] = useState('')

  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState(1)

  const [filters, setFilters] = useState({
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    displacement: { value: null, matchMode: FilterMatchMode.CONTAINS }
  })
  const [page, setPage] = useState(0)
  const [first, setFirst] = useState(0)

  const handleFilter = (evt) => {
    const oldFilters = filters
    oldFilters[evt.field] = evt.constraints.constraints[0]
    setFilters({ ...oldFilters })
  }

  const handleFilterClear = (evt) => {
    setFilters({
      name: { value: null, matchMode: FilterMatchMode.EQUALS },
      displacement: { value: null, matchMode: FilterMatchMode.EQUALS }
    })
  }
  useEffect(() => {
    const keys = Object.keys(filters)
    const computedFilterString = keys.map(e => {
      return {
        key: e,
        value: filters[e].value
      }
    }).filter(e => e.value).map(e => `${e.key}=${e.value}`).join('&')
    setFilterString(computedFilterString)
  }, [filters])

  const ships = useSelector(shipSelector)
  const count = useSelector(shipCountSelector)
  const crewmembers = useSelector(crewmemberSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getShips(filterString, page, 5, sortField, sortOrder)) // Get pagination endpoint limit
  }, [filterString, page, sortField, sortOrder])

  useEffect(() => {
    const data = [['Name', 'Displacement']]
    for (const ship of ships) {
      data.push([ship.name, ship.displacement])
    }
  }, [ships])

  // SHIP OPERATIONS

  const handleShipAddClick = (evt) => {
    setIsShipDialogShown(true)
    setIsNewRecord(true)
    setName('')
    setDisplacement(51)
  }

  const editShip = (rowData) => {
    setSelectedShip(rowData.id)
    setName(rowData.name)
    setDisplacement(rowData.displacement)

    setIsShipDialogShown(true)
    setIsNewRecord(false)
  }

  const handleShipSaveClick = () => {
    if (isNewRecord) {
      dispatch(addShip({ name, displacement }))
    } else {
      dispatch(saveShip(selectedShip, { name, displacement }))
    }
    hideShipDialog()
    setSelectedShip(null)
    setName('')
    setDisplacement(51)
  }

  const handleDeleteShip = (rowData) => {
    dispatch(deleteShip(rowData.id))
  }

  // CREWMEMBER OPERATIONS

  const handleCrewmemberAddClick = (evt) => {
    setIsCrewmemberDialogShown(true)
    hideChildrenDialog()
    setIsNewRecord(true)
    setName('')
    setRole('')
  }

  const editCrewmember = (rowData) => {
    setSelectedCrewmember(rowData.id)
    setName(rowData.name)
    setRole(rowData.role)

    setIsCrewmemberDialogShown(true)
    setIsNewRecord(false)
  }

  const handleCrewmemberSaveClick = () => {
    if (isNewRecord) {
      dispatch(addCrewmember(selectedShip, { name, role }))
    } else {
      dispatch(saveCrewmember(selectedShip, selectedCrewmember, { name, role }))
    }
    setIsCrewmemberDialogShown(false)
    setName('')
    setRole('')
  }

  const handleDeleteCrewmember = (rowData) => {
    hideChildrenDialog()
    dispatch(deleteCrewmember(selectedShip, rowData.id))
  }

  // SORT AND PAGINATION

  const handlePageChange = (evt) => {
    setPage(evt.page)
    setFirst(evt.page * 5)
  }

  const handleSort = (evt) => {
    console.warn(evt)
    setSortField(evt.sortField)
    setSortOrder(evt.sortOrder)
  }

  // HIDE DIALOGS

  const hideShipDialog = () => {
    setIsShipDialogShown(false)
  }

  const hideChildrenDialog = () => {
    setIsChildrenDialogShown(false)
  }

  const hideCrewmemberDialog = () => {
    setIsCrewmemberDialogShown(false)
  }

  // SHOW DIALOGS

  const renderChildrenDialog = () => {
    return (
      <DataTable footer={crewmemberTableFooter} value={crewmembers} responsiveLayout="scroll">
        <Column header='Name' field='name'></Column>
        <Column header='Role' field='role'></Column>
        <Column body={operationsCrewmemberColumn} />
      </DataTable>
    )
  }

  const viewChildren = (rowData) => {
    dispatch(getCrewmembers(rowData.id))
    setSelectedShip(rowData.id)
    setIsChildrenDialogShown(true)
    setIsNewRecord(false)
  }

  // FOOTERS

  const shipTableFooter = (
    <div>
      <Button label='Add ship' icon='pi pi-plus' onClick={handleShipAddClick} />
    </div>
  )

  const crewmemberTableFooter = (
    <div>
      <Button label='Add crewmember' icon='pi pi-plus' onClick={handleCrewmemberAddClick} />
    </div>
  )

  const dialogFooter = (
    <div>
      <Button label='Save' icon='pi pi-save' onClick={handleShipSaveClick} />
    </div>
  )

  const dialogSecondFooter = (
    <div>
      <Button label='Save' icon='pi pi-save' onClick={handleCrewmemberSaveClick} />
    </div>
  )

  // OPERATIONS

  const operationsColumn = (rowData) => {
    return (
      <>
        <Button label='Edit' icon='pi pi-pencil' onClick={() => editShip(rowData)} />
        <span> </span>
        <Button label='View crewmembers' icon='pi pi-search' className='p-button p-button-info' onClick={() => viewChildren(rowData)} />
        <span> </span>
        <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={() => handleDeleteShip(rowData)} />
      </>
    )
  }

  const operationsCrewmemberColumn = (rowData) => {
    return (
      <>
        <Button label='Edit' icon='pi pi-pencil' onClick={() => editCrewmember(rowData)} />
        <span> </span>
        <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={() => handleDeleteCrewmember(rowData)} />
      </>
    )
  }

  // DATATABLE

  return (
    <div>
      <DataTable
        value={ships}
        footer={shipTableFooter}
        lazy
        paginator
        onPage={handlePageChange}
        first={first}
        rows={5}
        totalRecords={count}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
      >
        <Column header='Name' field='name' filter filterField='name' filterPlaceholder='filter by name' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
        <Column header='Displacement' field='displacement' filter filterField='displacement' filterPlaceholder='filter by displacement' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
        <Column body={operationsColumn} />
      </DataTable>
      <Dialog header='New ship:' visible={isShipDialogShown} onHide={hideShipDialog} footer={dialogFooter}>
        <div>
          <InputText placeholder='Name' onChange={(evt) => setName(evt.target.value)} value={name} />
        </div>
        <br />
        <div>
          <InputText placeholder='Displacement' onChange={(evt) => setDisplacement(evt.target.value)} value={displacement} />
        </div>
      </Dialog>
      <Dialog header='New crewmember:' visible={isCrewmemberDialogShown} onHide={hideCrewmemberDialog} footer={dialogSecondFooter}>
        <div>
          <InputText placeholder='Name' onChange={(evt) => setName(evt.target.value)} value={name} />
        </div>
        <br />
        <div>
          <InputText placeholder='Role' onChange={(evt) => setRole(evt.target.value)} value={role} />
        </div>
      </Dialog>
      <Dialog header='Crewmembers' visible={isChildrenDialogShown} onHide={hideChildrenDialog}>
        {renderChildrenDialog()}
      </Dialog>
    </div>
  )
}

export default ShipList
