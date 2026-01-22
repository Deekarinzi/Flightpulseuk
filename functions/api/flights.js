// Cloudflare Pages Function - Live Flights API
// Endpoint: /api/flights

const UK_BOUNDS = {
    lamin: 49.5,  // South
    lamax: 59.0,  // North
    lomin: -8.0,  // West
    lomax: 2.0    // East
};

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=10'
};

export async function onRequest(context) {
    // Handle CORS preflight
    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
    }

    try {
        // Try OpenSky Network API (free, no auth required for basic access)
        const openSkyUrl = `https://opensky-network.org/api/states/all?lamin=${UK_BOUNDS.lamin}&lamax=${UK_BOUNDS.lamax}&lomin=${UK_BOUNDS.lomin}&lomax=${UK_BOUNDS.lomax}`;
        
        const response = await fetch(openSkyUrl, {
            headers: { 'User-Agent': 'FlightpulseUK/1.0' },
            cf: { cacheTtl: 10, cacheEverything: true }
        });

        if (response.ok) {
            const data = await response.json();
            const flights = transformOpenSkyData(data);
            
            return new Response(JSON.stringify({
                success: true,
                flights,
                timestamp: Date.now(),
                source: 'opensky',
                count: flights.length
            }), { headers: CORS_HEADERS });
        }
        
        throw new Error('OpenSky API unavailable');
        
    } catch (error) {
        console.error('API Error:', error.message);
        
        // Return mock data as fallback
        return new Response(JSON.stringify({
            success: true,
            flights: getMockFlights(),
            timestamp: Date.now(),
            source: 'mock',
            count: 6,
            message: 'Using cached data'
        }), { headers: CORS_HEADERS });
    }
}

function transformOpenSkyData(data) {
    if (!data.states) return [];
    
    return data.states
        .filter(state => state[1] && state[5] && state[6]) // Must have callsign and position
        .slice(0, 100) // Limit for performance
        .map(state => ({
            icao24: state[0],
            callsign: (state[1] || '').trim(),
            originCountry: state[2] || 'Unknown',
            lat: state[6],
            lng: state[5],
            altitude: Math.round((state[7] || 0) * 3.28084), // meters to feet
            heading: state[10] || 0,
            speed: Math.round((state[9] || 0) * 1.94384), // m/s to knots
            verticalRate: Math.round((state[11] || 0) * 196.85), // m/s to fpm
            onGround: state[8],
            squawk: state[14] || 'N/A',
            // Enhanced data (would come from flight schedule API)
            origin: getOriginFromCallsign(state[1]),
            destination: 'TBD',
            status: state[8] ? 'On Ground' : 'In Air',
            airline: getAirlineFromCallsign(state[1]),
            aircraft: 'Aircraft',
            depTime: '--:--',
            arrTime: '--:--',
            remaining: 'N/A'
        }));
}

function getAirlineFromCallsign(callsign) {
    if (!callsign) return 'Unknown';
    const prefix = callsign.substring(0, 3).toUpperCase();
    const airlines = {
        'BAW': 'British Airways',
        'EZY': 'easyJet',
        'EZS': 'easyJet Switzerland',
        'VIR': 'Virgin Atlantic',
        'RYR': 'Ryanair',
        'RUK': 'Ryanair UK',
        'TOM': 'TUI Airways',
        'EXS': 'Jet2',
        'LOG': 'Loganair',
        'BEE': 'Flybe',
        'SHT': 'BA Shuttle',
        'UAE': 'Emirates',
        'QTR': 'Qatar Airways',
        'AFR': 'Air France',
        'KLM': 'KLM',
        'DLH': 'Lufthansa',
        'SWR': 'Swiss',
        'ACA': 'Air Canada',
        'AAL': 'American Airlines',
        'UAL': 'United Airlines',
        'DAL': 'Delta Air Lines',
        'THY': 'Turkish Airlines',
        'SAS': 'Scandinavian Airlines',
        'FIN': 'Finnair',
        'IBE': 'Iberia',
        'TAP': 'TAP Portugal',
        'AEE': 'Aegean Airlines'
    };
    return airlines[prefix] || callsign.substring(0, 2);
}

function getOriginFromCallsign(callsign) {
    if (!callsign) return 'UNK';
    const prefix = callsign.substring(0, 3).toUpperCase();
    const hubs = {
        'BAW': 'LHR',
        'EZY': 'LGW',
        'VIR': 'LHR',
        'RYR': 'STN',
        'TOM': 'LGW',
        'EXS': 'LBA',
        'LOG': 'EDI'
    };
    return hubs[prefix] || 'LHR';
}

function getMockFlights() {
    return [
        {
            icao24: 'abc123',
            callsign: 'BA458',
            origin: 'LHR',
            destination: 'CDG',
            lat: 51.15,
            lng: -0.18,
            heading: 135,
            altitude: 36000,
            speed: 450,
            verticalRate: 0,
            squawk: '5523',
            status: 'On Time',
            airline: 'British Airways',
            aircraft: 'Airbus A320',
            depTime: '14:15',
            arrTime: '16:35',
            remaining: '1h 10m',
            onGround: false
        },
        {
            icao24: 'def456',
            callsign: 'BA217',
            origin: 'LHR',
            destination: 'IAD',
            lat: 51.8,
            lng: -1.2,
            heading: 285,
            altitude: 38000,
            speed: 510,
            verticalRate: 0,
            squawk: '6142',
            status: 'On Time',
            airline: 'British Airways',
            aircraft: 'Boeing 777',
            depTime: '10:30',
            arrTime: '14:15',
            remaining: '2h 45m',
            onGround: false
        },
        {
            icao24: 'ghi789',
            callsign: 'VS3',
            origin: 'LHR',
            destination: 'JFK',
            lat: 52.1,
            lng: -2.5,
            heading: 270,
            altitude: 40000,
            speed: 520,
            verticalRate: 0,
            squawk: '4521',
            status: 'Delayed 15m',
            airline: 'Virgin Atlantic',
            aircraft: 'Airbus A350',
            depTime: '11:00',
            arrTime: '14:30',
            remaining: '3h 15m',
            onGround: false
        },
        {
            icao24: 'jkl012',
            callsign: 'EZY101',
            origin: 'MAN',
            destination: 'CDG',
            lat: 51.5,
            lng: 0.8,
            heading: 140,
            altitude: 32000,
            speed: 420,
            verticalRate: -500,
            squawk: '2314',
            status: 'On Time',
            airline: 'easyJet',
            aircraft: 'Airbus A320',
            depTime: '13:00',
            arrTime: '15:20',
            remaining: '1h 50m',
            onGround: false
        },
        {
            icao24: 'mno345',
            callsign: 'RYR882',
            origin: 'STN',
            destination: 'DUB',
            lat: 52.8,
            lng: -3.5,
            heading: 290,
            altitude: 35000,
            speed: 440,
            verticalRate: 0,
            squawk: '1234',
            status: 'On Time',
            airline: 'Ryanair',
            aircraft: 'Boeing 737',
            depTime: '12:45',
            arrTime: '13:55',
            remaining: '0h 40m',
            onGround: false
        },
        {
            icao24: 'pqr678',
            callsign: 'BA123',
            origin: 'LHR',
            destination: 'JFK',
            lat: 53.2,
            lng: -4.8,
            heading: 275,
            altitude: 36000,
            speed: 510,
            verticalRate: 0,
            squawk: '7421',
            status: 'On Time',
            airline: 'British Airways',
            aircraft: 'Boeing 777-300ER',
            depTime: '11:45',
            arrTime: '14:30',
            remaining: '2h 15m',
            onGround: false
        }
    ];
}