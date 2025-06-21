import { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import Dashboard from './pages/Dashboard/Dashboard'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './pages/Login/Login'
import { UserProvider } from './context/Usercontext'
import Stocks from './pages/Stocks/Stocks'
import { SearchProvider } from './context/Searchcontext'
import Crypto from './pages/crypto/Crypto'
import News from './pages/News/News'

function App() {
  const [selectedStock,setSelectedStock] = useState(null);
  return(
    <Router>
      <UserProvider>
      <SearchProvider>
      <Navbar onSearch={setSelectedStock} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/stocks" element={<Stocks  />} />
        <Route path="/crypto" element={<Crypto />} />
        <Route path="/news" element={<News />} />
      </Routes>
      </SearchProvider>
      </UserProvider>
    </Router>
  )
}

export default App
