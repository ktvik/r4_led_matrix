import React, { useState, useEffect, useCallback } from 'react';
import { Bluetooth, Settings, Send, ArrowLeftRight, Gauge, Smartphone, WifiOff, BluetoothConnected } from 'lucide-react';

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

const App = () => {
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Klar for tilkobling");
  const [text, setText] = useState("HEI");
  const [speed, setSpeed] = useState(50);
  const [direction, setDirection] = useState(true);
  const [view, setView] = useState('main');

  const connectBluetooth = async () => {
    try {
      setStatus("Søker...");
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'UnoR4_Bluetooth' }],
        optionalServices: [SERVICE_UUID]
      });
      setStatus("Kobler til...");
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const char = await service.getCharacteristic(CHARACTERISTIC_UUID);
      setDevice(device);
      setCharacteristic(char);
      setIsConnected(true);
      setStatus("Tilkoblet!");
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setCharacteristic(null);
        setStatus("Frakoblet");
      });
    } catch (error) {
      setStatus("Feil: " + error.message);
    }
  };

  const sendData = useCallback(async (cmd) => {
    if (!characteristic || !isConnected) return;
    try {
      const encoder = new TextEncoder();
      await characteristic.writeValue(encoder.encode(cmd));
    } catch (error) {
      console.error("Sende-feil:", error);
    }
  }, [characteristic, isConnected]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isConnected) {
        sendData(`S:${speed}`);
        setTimeout(() => sendData(`D:${direction ? 'L' : 'R'}`), 100);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [speed, direction, isConnected, sendData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 flex flex-col max-w-md mx-auto font-sans">
      <header className="flex justify-between items-center py-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-2">
            <Smartphone className="text-blue-500" /> R4 MATRIX
          </h1>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{status}</p>
        </div>
        <button onClick={connectBluetooth} className={`p-4 rounded-2xl ${isConnected ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-600 shadow-lg shadow-blue-900/40'}`}>
          {isConnected ? <BluetoothConnected /> : <Bluetooth />}
        </button>
      </header>

      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl mb-8">
        <button onClick={() => setView('main')} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${view === 'main' ? 'bg-slate-800 text-blue-400 shadow-md' : 'text-slate-600'}`}>KONTROLL</button>
        <button onClick={() => setView('settings')} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${view === 'settings' ? 'bg-slate-800 text-blue-400 shadow-md' : 'text-slate-600'}`}>OPPSETT</button>
      </div>

      <main className="flex-grow">
        {view === 'main' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-black border-4 border-slate-900 p-6 rounded-[2rem] flex flex-col gap-1 items-center shadow-2xl">
              {[...Array(8)].map((_, r) => (
                <div key={r} className="flex gap-1.5">
                  {[...Array(12)].map((_, c) => (
                    <div key={c} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isConnected ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]' : 'bg-slate-800'}`} />
                  ))}
                </div>
              ))}
            </div>
            <div className="relative group">
              <input 
                type="text" value={text} onChange={(e) => setText(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-5 text-xl font-black text-white outline-none focus:border-blue-600 transition-all placeholder:text-slate-800"
                placeholder="Skriv tekst..."
              />
              <button onClick={() => sendData(`T:${text.toUpperCase()}`)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 p-3.5 rounded-xl active:scale-90 transition-transform shadow-xl"><Send size={20}/></button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-4 flex justify-between">
                <span>Hastighet</span>
                <span className="text-blue-500 font-mono">{speed}</span>
              </label>
              <input type="range" min="10" max="200" value={speed} onChange={(e) => setSpeed(e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
            </div>
            <button 
                onClick={() => setDirection(!direction)} 
                className="w-full bg-slate-900 p-8 rounded-[2rem] flex justify-between items-center border border-slate-800 active:scale-[0.98] transition-all group"
            >
               <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Retning</span>
                  <span className="font-black text-blue-500 uppercase tracking-tighter">{direction ? "Venstre ←" : "Høyre →"}</span>
               </div>
               <div className={`w-14 h-8 rounded-full p-1 transition-all ${direction ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all transform ${direction ? 'translate-x-6' : 'translate-x-0'}`} />
               </div>
            </button>
          </div>
        )}
      </main>
      <footer className="py-10 text-center opacity-20 flex flex-col items-center gap-2">
         <div className="h-[1px] w-20 bg-slate-500"></div>
         <p className="text-[10px] font-black uppercase tracking-[0.3em]">Standalone Web App</p>
      </footer>
    </div>
  );
};
export default App;
