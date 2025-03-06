import React, { useState, useEffect } from 'react';

const Calculator = () => {
  // State pentru valorile de intrare
  const [pretBaza, setPretBaza] = useState(1000);
  const [cantitate, setCantitate] = useState(125);
  const [cursEUR, setCursEUR] = useState(4.97);
  
  // State pentru parametrii calitativi
  const [greutateHectolitrica, setGreutateHectolitrica] = useState(77);
  const [proteina, setProteina] = useState(12);
  const [umiditate, setUmiditate] = useState(14);
  const [corpuriStraine, setCorpuriStraine] = useState(2);
  const [fuzarium, setFuzarium] = useState(0);
  const [boabeIncoltite, setBoabeIncoltite] = useState(0);
  const [infestare, setInfestare] = useState(false);
  
  // State pentru rezultate
  const [rezultat, setRezultat] = useState(null);
  
  // Parametrii calitativi standard conform contractului
  const parametriStandard = {
    greutateHectolitrica: {
      min: 75,
      baza: 77,
    },
    proteina: {
      min: 11.5,
      baza: 12,
    },
    umiditate: {
      baza: 14,
      max: 15,
    },
    corpuriStraine: {
      baza: 2,
      max: 4,
    },
    fuzarium: {
      max: 0,
    },
    boabeIncoltite: {
      max: 0,
    },
  };
  
  // Funcția de calcul a prețului
  const calculeazaPret = () => {
    let pretFinal = pretBaza;
    let cantitateFinala = cantitate;
    let aplicatReducereGrauFuraj = false;
    let motivReducere = [];
    let respingereRecomandată = false;
    
    // 1. Verificare greutate hectolitrică
    if (greutateHectolitrica < parametriStandard.greutateHectolitrica.baza) {
      if (greutateHectolitrica >= parametriStandard.greutateHectolitrica.min) {
        const diferenta = parametriStandard.greutateHectolitrica.baza - greutateHectolitrica;
        pretFinal -= diferenta; // reducere 1:1 din preț
        motivReducere.push({
          motiv: `Greutate hectolitrică sub bază (${greutateHectolitrica} kg/hl)`,
          valoare: `-${diferenta.toFixed(2)} lei/to`,
          detalii: `Baza: ${parametriStandard.greutateHectolitrica.baza} kg/hl, Actuală: ${greutateHectolitrica} kg/hl`
        });
      } else {
        // Sub 75 kg/hl: considerat Grâu Furaj
        if (!aplicatReducereGrauFuraj) {
          pretFinal -= 60;
          aplicatReducereGrauFuraj = true;
          motivReducere.push({
            motiv: `Greutate hectolitrică sub ${parametriStandard.greutateHectolitrica.min} kg/hl (Grâu Furaj)`,
            valoare: `-60 lei/to`,
            detalii: `Actuală: ${greutateHectolitrica} kg/hl`
          });
        }
      }
    }
    
    // 2. Verificare proteină
    if (proteina < parametriStandard.proteina.baza) {
      if (proteina >= parametriStandard.proteina.min) {
        const diferenta = parametriStandard.proteina.baza - proteina;
        const reducereEUR = (diferenta * 10) * 1; // 1 EUR pentru fiecare 0.1% în minus
        const reducereRON = reducereEUR * cursEUR;
        pretFinal -= reducereRON;
        motivReducere.push({
          motiv: `Proteină sub bază (${proteina}%)`,
          valoare: `-${reducereRON.toFixed(2)} lei/to (${reducereEUR.toFixed(2)} EUR)`,
          detalii: `Baza: ${parametriStandard.proteina.baza}%, Actuală: ${proteina}%`
        });
      } else {
        // Sub 11.5%: considerat Grâu Furaj
        if (!aplicatReducereGrauFuraj) {
          pretFinal -= 60;
          aplicatReducereGrauFuraj = true;
          motivReducere.push({
            motiv: `Proteină sub ${parametriStandard.proteina.min}% (Grâu Furaj)`,
            valoare: `-60 lei/to`,
            detalii: `Actuală: ${proteina}%`
          });
        }
      }
    }
    
    // 3. Verificare umiditate
    if (umiditate > parametriStandard.umiditate.baza) {
      const diferentaUmiditate = umiditate - parametriStandard.umiditate.baza;
      
      // Reducere din cantitate 1:1 pentru fiecare procent
      const reducereCantitate = cantitate * (diferentaUmiditate / 100);
      cantitateFinala -= reducereCantitate;
      motivReducere.push({
        motiv: `Umiditate peste bază (${umiditate}%)`,
        valoare: `-${reducereCantitate.toFixed(2)} tone (${diferentaUmiditate.toFixed(2)}% din cantitate)`,
        detalii: `Baza: ${parametriStandard.umiditate.baza}%, Actuală: ${umiditate}%`
      });
      
      // Dacă depășește maximul, se aplică și reducere de preț
      if (umiditate > parametriStandard.umiditate.max) {
        const costUscare = 25 * diferentaUmiditate;
        pretFinal -= costUscare;
        motivReducere.push({
          motiv: `Umiditate peste maxim (${umiditate}%)`,
          valoare: `-${costUscare.toFixed(2)} lei/to (cost uscare)`,
          detalii: `Maxim: ${parametriStandard.umiditate.max}%, Actuală: ${umiditate}%`
        });
      }
    }
    
    // 4. Verificare corpuri străine
    if (corpuriStraine > parametriStandard.corpuriStraine.baza) {
      const diferentaCS = corpuriStraine - parametriStandard.corpuriStraine.baza;
      
      // Reducere din cantitate 1:1 pentru fiecare procent
      const reducereCantitate = cantitate * (diferentaCS / 100);
      cantitateFinala -= reducereCantitate;
      motivReducere.push({
        motiv: `Corpuri străine peste bază (${corpuriStraine}%)`,
        valoare: `-${reducereCantitate.toFixed(2)} tone (${diferentaCS.toFixed(2)}% din cantitate)`,
        detalii: `Baza: ${parametriStandard.corpuriStraine.baza}%, Actuală: ${corpuriStraine}%`
      });
      
      // Dacă depășește maximul, se aplică și reducere de preț
      if (corpuriStraine > parametriStandard.corpuriStraine.max) {
        const operatiuniTarare = Math.ceil(corpuriStraine / 4.00);
        const costConditionare = 15 * operatiuniTarare;
        pretFinal -= costConditionare;
        motivReducere.push({
          motiv: `Corpuri străine peste maxim (${corpuriStraine}%)`,
          valoare: `-${costConditionare.toFixed(2)} lei/to (cost condiționare)`,
          detalii: `Maxim: ${parametriStandard.corpuriStraine.max}%, Actuală: ${corpuriStraine}%, Operațiuni: ${operatiuniTarare}`
        });
      }
    }
    
    // 5. Verificare fuzarium - poate duce la respingere sau negociere nouă
    if (fuzarium > parametriStandard.fuzarium.max) {
      respingereRecomandată = true;
      motivReducere.push({
        motiv: `Boabe atacate de fuzarium peste limită (${fuzarium}%)`,
        valoare: `RESPINGERE RECOMANDATĂ`,
        detalii: `Maxim: ${parametriStandard.fuzarium.max}%, Actuală: ${fuzarium}%`
      });
    }
    
    // 6. Verificare boabe încolțite - poate duce la respingere
    if (boabeIncoltite > parametriStandard.boabeIncoltite.max) {
      respingereRecomandată = true;
      motivReducere.push({
        motiv: `Boabe încolțite peste limită (${boabeIncoltite}%)`,
        valoare: `RESPINGERE RECOMANDATĂ`,
        detalii: `Maxim: ${parametriStandard.boabeIncoltite.max}%, Actuală: ${boabeIncoltite}%`
      });
    }
    
    // 7. Verificare infestare
    if (infestare) {
      pretFinal -= 15;
      motivReducere.push({
        motiv: `Infestare detectată`,
        valoare: `-15 lei/to`,
        detalii: `Opțional: posibilitate de respingere`
      });
    }
    
    // Calculul valorii totale
    const valoareTotala = pretFinal * cantitateFinala;
    
    setRezultat({
      pretInitial: pretBaza,
      pretFinal: pretFinal,
      cantitateInitiala: cantitate,
      cantitateFinala: cantitateFinala,
      valoareTotala: valoareTotala,
      motivReducere: motivReducere,
      respingereRecomandată: respingereRecomandată
    });
  };
  
  // Calculează automat când se schimbă oricare dintre parametri
  useEffect(() => {
    calculeazaPret();
  }, [
    pretBaza, cantitate, cursEUR, 
    greutateHectolitrica, proteina, umiditate, 
    corpuriStraine, fuzarium, boabeIncoltite, infestare
  ]);
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Calculator Preț Cereale (Grâu)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Date Generale</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preț bază (RON/to)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={pretBaza}
                onChange={(e) => setPretBaza(Number(e.target.value))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cantitate (tone)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={cantitate}
                onChange={(e) => setCantitate(Number(e.target.value))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Curs EUR/RON</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={cursEUR}
                onChange={(e) => setCursEUR(Number(e.target.value))}
                step="0.01"
              />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">Parametri Calitativi</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Greutate hectolitrică (kg/hl) 
                <span className="text-gray-500 ml-1 text-xs">
                  [Baza: {parametriStandard.greutateHectolitrica.baza}, Min: {parametriStandard.greutateHectolitrica.min}]
                </span>
              </label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={greutateHectolitrica}
                onChange={(e) => setGreutateHectolitrica(Number(e.target.value))}
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Proteină (%) 
                <span className="text-gray-500 ml-1 text-xs">
                  [Baza: {parametriStandard.proteina.baza}%, Min: {parametriStandard.proteina.min}%]
                </span>
              </label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={proteina}
                onChange={(e) => setProteina(Number(e.target.value))}
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Umiditate (%) 
                <span className="text-gray-500 ml-1 text-xs">
                  [Baza: {parametriStandard.umiditate.baza}%, Max: {parametriStandard.umiditate.max}%]
                </span>
              </label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={umiditate}
                onChange={(e) => setUmiditate(Number(e.target.value))}
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Corpuri străine (%) 
                <span className="text-gray-500 ml-1 text-xs">
                  [Baza: {parametriStandard.corpuriStraine.baza}%, Max: {parametriStandard.corpuriStraine.max}%]
                </span>
              </label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={corpuriStraine}
                onChange={(e) => setCorpuriStraine(Number(e.target.value))}
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Fuzarium (%) 
                <span className="text-gray-500 ml-1 text-xs">
                  [Max: {parametriStandard.fuzarium.max}%]
                </span>
              </label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={fuzarium}
                onChange={(e) => setFuzarium(Number(e.target.value))}
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Boabe încolțite (%) 
                <span className="text-gray-500 ml-1 text-xs">
                  [Max: {parametriStandard.boabeIncoltite.max}%]
                </span>
              </label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={boabeIncoltite}
                onChange={(e) => setBoabeIncoltite(Number(e.target.value))}
                step="0.01"
              />
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="infestare"
                checked={infestare}
                onChange={(e) => setInfestare(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
              />
              <label htmlFor="infestare" className="text-sm font-medium">
                Infestare (reducere 15 lei/to sau respingere)
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Rezultate Calcul</h2>
          
          {rezultat && (
            <div>
              {rezultat.respingereRecomandată && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <strong className="font-bold">Atenție!</strong> Respingere recomandată datorită parametrilor care depășesc limitele acceptate.
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Preț inițial:</p>
                  <p className="text-lg font-semibold">{rezultat.pretInitial.toFixed(2)} RON/to</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preț final:</p>
                  <p className="text-lg font-semibold">{rezultat.pretFinal.toFixed(2)} RON/to</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cantitate inițială:</p>
                  <p className="text-lg font-semibold">{rezultat.cantitateInitiala.toFixed(2)} tone</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cantitate finală:</p>
                  <p className="text-lg font-semibold">{rezultat.cantitateFinala.toFixed(2)} tone</p>
                </div>
                <div className="col-span-2 border-t pt-3 mt-2">
                  <p className="text-sm text-gray-600">Valoare totală:</p>
                  <p className="text-xl font-bold">{rezultat.valoareTotala.toFixed(2)} RON</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-3">Ajustări aplicate:</h3>
              
              {rezultat.motivReducere.length > 0 ? (
                <div className="space-y-3">
                  {rezultat.motivReducere.map((motiv, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="font-medium">{motiv.motiv}</p>
                      <p className="text-lg font-bold">{motiv.valoare}</p>
                      <p className="text-sm text-gray-600">{motiv.detalii}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-600">Nu există ajustări - marfa corespunde parametrilor de bază.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;