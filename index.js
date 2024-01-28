const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

const mongodburi = "mongodb+srv://daro-time:darotimepassword123@cluster0.1hcpvfd.mongodb.net/?retryWrites=true&w=majority"

// Connect to MongoDB
mongoose.connect(mongodburi, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for Todo
const TodoSchema = new mongoose.Schema({
    text: String
});

// Create a model
const Todo = mongoose.model('Todo', TodoSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', async (req, res) => {
    const todos = await Todo.find();
    let todoList = todos.map(todo => `<li>${todo.text}</li>`).join('');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                form, ul {
                    width: 90%;
                    max-width: 400px;
                }
                input, button {
                    padding: 10px;
                    margin: 5px 0;
                }
                ul {
                    list-style-type: none;
                    padding: 0;
                }
                li {
                    background-color: #f4f4f4;
                    margin: 5px 0;
                    padding: 10px;
                    border-radius: 4px;
                }
                /* Responsive design for tablets and larger devices */
                @media (min-width: 600px) {
                    form, ul {
                        width: 80%;
                    }
                }
            </style>
        </head>
        <body>
            <h1>Todo List</h1>
            <form action="/add-todo" method="post">
                <input type="text" name="todo" placeholder="Add new todo">
                <button type="submit">Add</button>
            </form>
            <ul>${todoList}</ul>
        </body>
        </html>
    `);
});


app.post('/add-todo', (req, res) => {
    const newTodo = new Todo({ text: req.body.todo });
    newTodo.save().then(() => res.redirect('/'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
