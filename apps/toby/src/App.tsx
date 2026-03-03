import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import NumberPicker from './routes/NumberPicker';
import BallPicker from './routes/BallPicker';
import SeatRandom from './routes/SeatRandom';
import SeatSettings from './routes/SeatSettings';

function App() {
  return (
    <BrowserRouter basename="/toby">
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/number" element={<NumberPicker />} />
          <Route path="/ball" element={<BallPicker />} />
          <Route path="/seat" element={<SeatRandom />} />
          <Route path="/seat/settings" element={<SeatSettings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

