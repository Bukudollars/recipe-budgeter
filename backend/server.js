const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require('mysql2')

require('dotenv').config()
app.use(cors())
app.use(express.json())

///////////////////////////////////////////////////////////////////////////////////////

//                              SQL Server Connection  

///////////////////////////////////////////////////////////////////////////////////////

const connection = mysql.createConnection({
  host: process.env.mysqlHost,
  user: process.env.mysqlUser,  
  password: process.env.mysqlPassword,
  database: process.env.mysqlDatabase, 
  port: 3306                
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as ID', connection.threadId);
});



///////////////////////////////////////////////////////////////////////////////////////

//                              API END POINTS  

///////////////////////////////////////////////////////////////////////////////////////

// Create New User
app.post('/api/register', (req, res) => {
    const { username, password } = req.body
    const query = `INSERT INTO users (username , password) VALUES (?, ?, ?)`
    connection.query(query, [username, password], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to register user' })
        } else {
        res.status(201).json({ message: 'User registered successfully' })
        }
    })
})

// Check Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`
    connection.query(query, [username, password], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to login' })
        } else if (results.length === 0) {
        res.status(401).json({ message: 'Invalid credentials' })
        } else {
        res.status(200).json({ message: 'Login successful' })
        }
    })
})

// Delete User
app.post('/api/deleteUser', (req, res) => {
    const { username } = req.body
    const query = `DELETE FROM users WHERE username = ?`
    connection.query(query, [username], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to delete user' })
        } else {
        res.status(200).json({ message: 'User deleted successfully' })
        }
    })
})

// Get All Recipes
app.get('/api/getAllRecipes', (req, res) => {
    const query = `SELECT * FROM recipe`
    connection.query(query, (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to get recipes' })
        } else {
        res.status(200).json(results)
        }
    })
})

// Get Specific Recipe
app.get('/api/getRecipe', (req, res) => {
    const query = `SELECT * FROM recipe WHERE recipeID = ?`
    connection.query(query, [recipeID], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to get recipe' })
        } else {
        res.status(200).json(results)
        }
    })
})

// Add New Recipe
app.post('/api/addRecipe', (req, res) => {
    const { name, ingredients, instructions } = req.body
    const query = `INSERT INTO recipe (name, ingredients, instructions) VALUES (?, ?, ?)`
    connection.query(query, [recipeName, description, userID], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to add recipe' })
        } else {
        res.status(201).json({ message: 'Recipe added successfully' })
        }
    })
})

// Delete Recipe
app.post('/api/deleteRecipe', (req, res) => {
  const { recipeID } = req.body
  const query = `DELETE FROM recipe WHERE recipeID = ?`
  connection.query(query, [recipeID], (err, results) => {
      if (err) {
      console.error(err)
      res.status(500).json({ message: 'Failed to delete recipe' })
      } else {
      res.status(200).json({ message: 'Recipe deleted successfully' })
      }
  })
})

// Add Item to Recipe
app.post('/api/addRecipeItem', (req, res) => {
    const { recipeID, quantity, unitID } = req.body
    const query = `INSERT INTO recipe_item (recipe_id, quantity, unit) VALUES (?, ?, ?)`
    connection.query(query, [recipeID, quantity, unitID], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to add recipe item' })
        } else {
        res.status(201).json({ message: 'Recipe item added successfully' })
        }
    })
})

// Delete Item from Recipe
app.post('/api/deleteRecipeItem', (req, res) => {
    const { recipeID, itemID } = req.body
    const query = `DELETE FROM recipe_item WHERE recipeID = ? AND itemID = ?`
    connection.query(query, [recipeID, itemID], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to delete recipe item' })
        } 
        else {
        res.status(200).json({ message: 'Recipe item deleted successfully' })
        }
    })
})

// Get Conversion for Specific Unit
app.get('/api/getConversion', (req, res) => {
    let type = '';
    const { unitID } = req.query;
    const query = `SELECT unitType FROM unit WHERE unitID = ?`
    connection.query(query, [unitID], (err, results) => {
        if (err) {
            console.error(err)
            res.status(500).json({ message: 'Failed to get conversion' })
        } 
        else {
            type = results.length > 0 ? results[0].unitType : null;
        }
    })
    
    if (type === 'mass') {
        const query = 'SELECT kgConversion from mass_unit WHERE unitID = ?'
        connection.query(query, [unitID], (err, results) => {
            if (err) {
                console.error(err)
                res.status(500).json({ message: 'Failed to get conversion' })
            } 
            else {
                res.status(200).json(results)
            }
        })
    }
    else if (type === 'volume') {
        const query = 'SELECT literConversion from volume_unit WHERE unitID = ?'
        connection.query(query, [unitID], (err, results) => {
            if (err) {
                console.error(err)
                res.status(500).json({ message: 'Failed to get conversion' })
            } 
            else {
                res.status(200).json(results)
            }
        })
    }
    else {
        res.status(500).json({ message: 'Failed to get conversion' })
    }
})

app.listen(1337, () => {
    console.log('Server started on 1337')
})