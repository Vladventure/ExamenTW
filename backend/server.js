require('dotenv').config({})
const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const cors = require('cors')
const path = require('path')

let sequelize

if (process.env.NODE_ENV === 'development') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'sample.db',
    define: {
      timestamps: false
    }
  })
} else {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })
}

const Ship = sequelize.define('ship', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [3, 999]
    }
  },
  displacement: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 51
    }
  }
})

const CrewMember = sequelize.define('crewmember', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [5, 999]
    }
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: [['CAPTAIN', 'BOATSWAIN', 'DECKHAND']]
    }
  }
})

Ship.hasMany(CrewMember)
Ship.hasMany(CrewMember, { foreignKey: 'shipId' });
CrewMember.belongsTo(Ship, { foreignKey: 'shipId' });

const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname, 'build')))
app.use(bodyParser.json())

app.get('/sync', async (req, res) => {
  try {
    await sequelize.sync({ force: true })
    res.status(201).json({ message: 'Database synced' })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/ships', async (req, res) => {
  try {
    const query = {}
    let pageSize = 5
    const allowedFilters = ['name', 'displacement']
    const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
    if (filterKeys.length > 0) {
      query.where = {}
      for (const key of filterKeys) {
        query.where[key] = { [Op.like]: `${req.query[key]}` }
      }
    }

    const sortField = req.query.sortField
    let sortOrder = 'ASC'
    if (req.query.sortOrder && req.query.sortOrder === '-1') {
      sortOrder = 'DESC'
    }

    if (req.query.pageSize) {
      pageSize = parseInt(req.query.pageSize)
    }

    if (sortField) {
      query.order = [[sortField, sortOrder]]
    }

    if (!isNaN(parseInt(req.query.page))) {
      query.limit = pageSize
      query.offset = pageSize * parseInt(req.query.page)
    }

    const records = await Ship.findAll(query)
    const count = await Ship.count()

    res.status(200).json({ records, count })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/ships/:id', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.id)
    if (ship) {
      res.status(200).json(ship)
    } else {
      res.status(404).json({ message: 'Ship not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/ships', async (req, res) => {
  try {
    if (req.query.bulk && req.query.bulk === 'on') {
      await Ship.bulkCreate(req.body)
      res.status(201).json({ message: 'Ships created' })
    } else {
      await Ship.create(req.body)
      res.status(201).json({ message: 'Ship created' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.put('/ships/:id', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.id)
    if (ship) {
      await ship.update(req.body, { fields: ['name', 'displacement'] })
      res.status(202).json({ message: 'Ship updated' })
    } else {
      res.status(404).json({ message: 'Ship not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.delete('/ships/:id', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.id, { include: CrewMember })
    if (ship) {
      await ship.destroy()
      res.status(202).json({ message: 'Ship deleted' })
    } else {
      res.status(404).json({ message: 'Ship not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/ships/:sid/crewmembers', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.sid)
    if (ship) {
      const crewmembers = await ship.getCrewmembers()
      res.status(200).json(crewmembers)
    } else {
      res.status(404).json({ message: 'Ship not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/ships/:sid/crewmembers/:cid', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.sid)
    if (ship) {
      const crewmembers = await ship.getCrewmembers({ where: { id: req.params.cid } })
      const crewmember = crewmembers.shift()
      if (crewmember) {
        res.status(200).json(crewmember)
      } else {
        res.status(404).json({ message: 'Crewmember not found' })
      }
    } else {
      res.status(404).json({ message: 'Ship not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/ships/:sid/crewmembers', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.sid)
    if (ship) {
      const crewmember = req.body
      crewmember.shipId = ship.id
      await CrewMember.create(crewmember)
      res.status(201).json({ message: 'Crewmember created' })
    } else {
      res.status(404).json({ message: 'Ship not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.put('/ships/:sid/crewmembers/:cid', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.sid)
    if (ship) {
      const crewmembers = await ship.getCrewmembers({ where: { id: req.params.cid } })
      const crewmember = crewmembers.shift()
      if (crewmember) {
        await crewmember.update(req.body)
        res.status(202).json({ message: 'Crewmember updated' })
      } else {
        res.status(404).json({ message: 'Crewmember not found' })
      }
    } else {
      res.status(404).json({ message: 'Ship not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.delete('/ships/:sid/crewmembers/:cid', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.sid)
    if (ship) {
      const crewmembers = await ship.getCrewmembers({ where: { id: req.params.cid } })
      const crewmember = crewmembers.shift()
      if (crewmember) {
        await crewmember.destroy()
        res.status(202).json({ message: 'Crewmate deleted' })
      } else {
        res.status(404).json({ message: 'Crewmember not found' })
      }
    } else {
      res.status(404).json({ message: 'Ship not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.listen(process.env.PORT, async () => {
  await sequelize.sync({ alter: true })
})
