require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

const authRoutes = require('./routes/auth.routes');
const verifyToken = require('./middleware/auth.middleware');

connectDB();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);

app.use(verifyToken);

const userRoutes = require('./routes/user.routes');
const peopleRoutes = require('./routes/people.routes');
const projectRoutes = require('./routes/project.routes');
const categoryRoutes = require('./routes/category.routes');
const subCategoryRoutes = require('./routes/subCategory.routes');
const expenseRoutes = require('./routes/expense.routes');
const incomeRoutes = require('./routes/income.routes');

app.use('/api/users', userRoutes);
app.use('/api/peoples', peopleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sub-categories', subCategoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);

app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/users (etc...)`);
});