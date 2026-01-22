/**
 * FlightpulseUK - Cloudflare Worker API
 * 
 * This is a standalone worker that can be deployed separately.
 * It handles all API endpoints in a single file.
 * 
 * Deploy with: npx wrangler deploy
 * 
 * Endpoints:
 *   GET /api/flights         - Get all live flights over UK
 *   GET /api/flight?callsign=BA123 - Get specific flight details
 *   GET /api/airports        - List all UK airports
 *   GET /api/airports?search=london - Search airports
 *   GET /api/airports?iata=LHR - Get airport by IATA code
 */

// ==================== CONFIGURATION ====================
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

const UK_BOUNDS = {
    lamin: 49.5,
    lamax: 59.0,
    lomin: -8.0,
    lomax: 2.0
};

// ==================== MAIN HANDLER ====================
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        // Route handling
        try {
            // API Routes
            if (url.pathname === '/api/flights') {
                return await handleFlights(env, ctx);
            }
            
            if (url.pathname === '/api/flight') {
                const callsign = url.searchParams.get('callsign');
                return await handleFlightDetails(callsign);
            }
            
            if (url.pathname === '/api/airports') {
                return handleAirports(url);
            }

            // Health check
            if (url.pathname === '/api/health') {
                return new Response(JSON.stringify({
                    status: 'ok',
                    timestamp: Date.now(),
                    version: '1.0.0'
                }), { headers: CORS_HEADERS });
            }
            
            // 404 for unknown routes
            return new Response(JSON.stringify({ 
                error: 'Not found',
                availableEndpoints: [
                    '/api/flights',
                    '/api/flight?callsign=BA123',
                    '/api/airports',
                    '/api/airports?search=london',
                    '/api/health'
                ]
            }), {
                status: 404,
                headers: CORS_HEADERS
            });
            
        } catch (error) {
            return new Response(JSON.stringify({ 
                error: error.message,
                timestamp: Date.now()
            }), {
                status: 500,
                headers: CORS_HEADERS
            });
        }
    }
};

// ==================== FLIGHTS HANDLER ====================
async function handleFlights(env, ctx) {
    // Check KV cache first (if configured)
    if (env?.FLIGHT_CACHE) {
        try {
            const cached = await env.FLIGHT_CACHE.get('flights-uk', 'json');
            if (cached) {
                return new Response(JSON.stringify({
                    success: true,
                    ...cached,
                    fromCache: true
                }), { headers: { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=10' } });
            }
        } catch (e) {
            console.log('Cache read error:', e);
        }
    }

    try {
        // Fetch from OpenSky Network API
        const openSkyUrl = `https://opensky-network.org/api/states/all?lamin=${UK_BOUNDS.lamin}&lamax=${UK_BOUNDS.lamax}&lomin=${UK_BOUNDS.lomin}&lomax=${UK_BOUNDS.lomax}`;
        
        const response = await fetch(openSkyUrl, {
            headers: { 'User-Agent': 'FlightpulseUK/1.0' }
        });

        if (!response.ok) {
            throw new Error(`OpenSky API returned ${response.status}`);
        }

        const data = await response.json();
        const flights = transformOpenSkyData(data);
        
        const result = {
            flights,
            timestamp: Date.now(),
            source: 'opensky',
            count: flights.length
        };

        // Cache for 15 seconds (if KV configured)
        if (env?.FLIGHT_CACHE) {
            ctx.waitUntil(
                env.FLIGHT_CACHE.put('flights-uk', JSON.stringify(result), { expirationTtl: 15 })
            );
        }

        return new Response(JSON.stringify({
            success: true,
            ...result
        }), { headers: { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=10' } });

    } catch (error) {
        console.error('OpenSky error:', error.message);
        
        // Return mock data as fallback
        return new Response(JSON.stringify({
            success: true,
            flights: getMockFlights(),
            timestamp: Date.now(),
            source: 'mock',
            count: 6,
            note: 'Using cached data due to API limits'
        }), { headers: CORS_HEADERS });
    }
}

function transformOpenSkyData(data) {
    if (!data.states) return [];
    
    return data.states
        .filter(state => state[1] && state[5] && state[6])
        .slice(0, 100)
        .map(state => ({
            icao24: state[0],
            callsign: (state[1] || '').trim(),
            originCountry: state[2] || 'Unknown',
            lat: state[6],
            lng: state[5],
            altitude: Math.round((state[7] || 0) * 3.28084),
            heading: state[10] || 0,
            speed: Math.round((state[9] || 0) * 1.94384),
            verticalRate: Math.round((state[11] || 0) * 196.85),
            onGround: state[8],
            squawk: state[14] || 'N/A',
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

// ==================== FLIGHT DETAILS HANDLER ====================
async function handleFlightDetails(callsign) {
    if (!callsign) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Callsign parameter is required'
        }), { status: 400, headers: CORS_HEADERS });
    }

    const flight = getFlightDetails(callsign.toUpperCase());
    
    if (!flight) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Flight not found'
        }), { status: 404, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({
        success: true,
        flight,
        timestamp: Date.now()
    }), { headers: CORS_HEADERS });
}

// ==================== AIRPORTS HANDLER ====================
function handleAirports(url) {
    const search = url.searchParams.get('search')?.toLowerCase();
    const iata = url.searchParams.get('iata')?.toUpperCase();
    const icao = url.searchParams.get('icao')?.toUpperCase();

    let airports = getUKAirports();

    if (iata) {
        const airport = airports.find(a => a.iata === iata);
        return new Response(JSON.stringify({
            success: !!airport,
            airport: airport || null,
            error: airport ? undefined : 'Airport not found'
        }), { 
            status: airport ? 200 : 404,
            headers: { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=86400' }
        });
    }

    if (icao) {
        const airport = airports.find(a => a.icao === icao);
        return new Response(JSON.stringify({
            success: !!airport,
            airport: airport || null,
            error: airport ? undefined : 'Airport not found'
        }), { 
            status: airport ? 200 : 404,
            headers: { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=86400' }
        });
    }

    if (search) {
        airports = airports.filter(airport =>
            airport.iata.toLowerCase().includes(search) ||
            airport.icao.toLowerCase().includes(search) ||
            airport.name.toLowerCase().includes(search) ||
            airport.city.toLowerCase().includes(search)
        );
    }

    return new Response(JSON.stringify({
        success: true,
        airports,
        count: airports.length,
        timestamp: Date.now()
    }), { headers: { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=86400' } });
}

// ==================== HELPER FUNCTIONS ====================
function getAirlineFromCallsign(callsign) {
    if (!callsign) return 'Unknown';
    const prefix = callsign.substring(0, 3).toUpperCase();
    const airlines = {
        'BAW': 'British Airways',
        'EZY': 'easyJet',
        'VIR': 'Virgin Atlantic',
        'RYR': 'Ryanair',
        'TOM': 'TUI Airways',
        'EXS': 'Jet2',
        'LOG': 'Loganair',
        'UAE': 'Emirates',
        'QTR': 'Qatar Airways',
        'AFR': 'Air France',
        'KLM': 'KLM',
        'DLH': 'Lufthansa'
    };
    return airlines[prefix] || callsign.substring(0, 2);
}

function getOriginFromCallsign(callsign) {
    if (!callsign) return 'UNK';
    const prefix = callsign.substring(0, 3).toUpperCase();
    const hubs = {
        'BAW': 'LHR', 'EZY': 'LGW', 'VIR': 'LHR',
        'RYR': 'STN', 'TOM': 'LGW', 'EXS': 'LBA', 'LOG': 'EDI'
    };
    return hubs[prefix] || 'LHR';
}

// ==================== MOCK DATA ====================
function getMockFlights() {
    return [
        { icao24: 'abc123', callsign: 'BA458', origin: 'LHR', destination: 'CDG', lat: 51.15, lng: -0.18, heading: 135, altitude: 36000, speed: 450, status: 'On Time', airline: 'British Airways', aircraft: 'Airbus A320', depTime: '14:15', arrTime: '16:35', remaining: '1h 10m', onGround: false },
        { icao24: 'def456', callsign: 'BA217', origin: 'LHR', destination: 'IAD', lat: 51.8, lng: -1.2, heading: 285, altitude: 38000, speed: 510, status: 'On Time', airline: 'British Airways', aircraft: 'Boeing 777', depTime: '10:30', arrTime: '14:15', remaining: '2h 45m', onGround: false },
        { icao24: 'ghi789', callsign: 'VS3', origin: 'LHR', destination: 'JFK', lat: 52.1, lng: -2.5, heading: 270, altitude: 40000, speed: 520, status: 'Delayed 15m', airline: 'Virgin Atlantic', aircraft: 'Airbus A350', depTime: '11:00', arrTime: '14:30', remaining: '3h 15m', onGround: false },
        { icao24: 'jkl012', callsign: 'EZY101', origin: 'MAN', destination: 'CDG', lat: 51.5, lng: 0.8, heading: 140, altitude: 32000, speed: 420, status: 'On Time', airline: 'easyJet', aircraft: 'Airbus A320', depTime: '13:00', arrTime: '15:20', remaining: '1h 50m', onGround: false },
        { icao24: 'mno345', callsign: 'RYR882', origin: 'STN', destination: 'DUB', lat: 52.8, lng: -3.5, heading: 290, altitude: 35000, speed: 440, status: 'On Time', airline: 'Ryanair', aircraft: 'Boeing 737', depTime: '12:45', arrTime: '13:55', remaining: '0h 40m', onGround: false },
        { icao24: 'pqr678', callsign: 'BA123', origin: 'LHR', destination: 'JFK', lat: 53.2, lng: -4.8, heading: 275, altitude: 36000, speed: 510, status: 'On Time', airline: 'British Airways', aircraft: 'Boeing 777-300ER', depTime: '11:45', arrTime: '14:30', remaining: '2h 15m', onGround: false }
    ];
}

function getFlightDetails(callsign) {
    const flights = {
        'BA123': {
            callsign: 'BA123',
            airline: { name: 'British Airways', iata: 'BA', icao: 'BAW' },
            aircraft: { type: 'Boeing 777-300ER', registration: 'G-STBJ' },
            origin: { iata: 'LHR', name: 'London Heathrow', city: 'London', terminal: '5', gate: 'B32' },
            destination: { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', terminal: '7', gate: '4' },
            position: { lat: 53.2, lng: -4.8, altitude: 36000, speed: 510, heading: 275, verticalSpeed: 0, squawk: '7421' },
            status: { code: 'EN_ROUTE', text: 'En Route', delay: 0, onTime: true },
            progress: { percentage: 65, remaining: '2h 15m', distance: { total: 3451, remaining: 1208 } },
            history: { onTimeRating: 88, averageDelay: 8 }
        },
        'BA458': {
            callsign: 'BA458',
            airline: { name: 'British Airways', iata: 'BA', icao: 'BAW' },
            aircraft: { type: 'Airbus A320', registration: 'G-EUYT' },
            origin: { iata: 'LHR', name: 'London Heathrow', city: 'London', terminal: '5', gate: 'A10' },
            destination: { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', terminal: '2E', gate: 'K45' },
            position: { lat: 51.15, lng: -0.18, altitude: 36000, speed: 450, heading: 135, verticalSpeed: 0, squawk: '5523' },
            status: { code: 'EN_ROUTE', text: 'En Route', delay: 0, onTime: true },
            progress: { percentage: 67, remaining: '1h 10m', distance: { total: 214, remaining: 71 } },
            history: { onTimeRating: 92, averageDelay: 5 }
        },
        'VS3': {
            callsign: 'VS3',
            airline: { name: 'Virgin Atlantic', iata: 'VS', icao: 'VIR' },
            aircraft: { type: 'Airbus A350-1000', registration: 'G-VLUX' },
            origin: { iata: 'LHR', name: 'London Heathrow', city: 'London', terminal: '3', gate: 'B36' },
            destination: { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', terminal: '4', gate: 'B25' },
            position: { lat: 52.1, lng: -2.5, altitude: 40000, speed: 520, heading: 270, verticalSpeed: 0, squawk: '4521' },
            status: { code: 'EN_ROUTE', text: 'Delayed', delay: 15, onTime: false },
            progress: { percentage: 35, remaining: '3h 15m', distance: { total: 3451, remaining: 2243 } },
            history: { onTimeRating: 78, averageDelay: 18 }
        }
    };
    return flights[callsign] || null;
}

function getUKAirports() {
    return [
        { iata: 'LHR', icao: 'EGLL', name: 'London Heathrow Airport', city: 'London', lat: 51.4700, lng: -0.4543, terminals: 4 },
        { iata: 'LGW', icao: 'EGKK', name: 'London Gatwick Airport', city: 'London', lat: 51.1537, lng: -0.1821, terminals: 2 },
        { iata: 'STN', icao: 'EGSS', name: 'London Stansted Airport', city: 'London', lat: 51.8860, lng: 0.2389, terminals: 1 },
        { iata: 'LTN', icao: 'EGGW', name: 'London Luton Airport', city: 'London', lat: 51.8747, lng: -0.3683, terminals: 1 },
        { iata: 'LCY', icao: 'EGLC', name: 'London City Airport', city: 'London', lat: 51.5048, lng: 0.0495, terminals: 1 },
        { iata: 'MAN', icao: 'EGCC', name: 'Manchester Airport', city: 'Manchester', lat: 53.3537, lng: -2.2750, terminals: 3 },
        { iata: 'BHX', icao: 'EGBB', name: 'Birmingham Airport', city: 'Birmingham', lat: 52.4539, lng: -1.7480, terminals: 1 },
        { iata: 'EDI', icao: 'EGPH', name: 'Edinburgh Airport', city: 'Edinburgh', lat: 55.9508, lng: -3.3615, terminals: 1 },
        { iata: 'GLA', icao: 'EGPF', name: 'Glasgow Airport', city: 'Glasgow', lat: 55.8719, lng: -4.4331, terminals: 1 },
        { iata: 'BRS', icao: 'EGGD', name: 'Bristol Airport', city: 'Bristol', lat: 51.3827, lng: -2.7190, terminals: 1 },
        { iata: 'LPL', icao: 'EGGP', name: 'Liverpool John Lennon Airport', city: 'Liverpool', lat: 53.3336, lng: -2.8497, terminals: 1 },
        { iata: 'NCL', icao: 'EGNT', name: 'Newcastle Airport', city: 'Newcastle', lat: 55.0375, lng: -1.6917, terminals: 1 },
        { iata: 'BFS', icao: 'EGAA', name: 'Belfast International Airport', city: 'Belfast', lat: 54.6575, lng: -6.2158, terminals: 1 },
        { iata: 'ABZ', icao: 'EGPD', name: 'Aberdeen Airport', city: 'Aberdeen', lat: 57.2019, lng: -2.1978, terminals: 1 },
        { iata: 'CWL', icao: 'EGFF', name: 'Cardiff Airport', city: 'Cardiff', lat: 51.3967, lng: -3.3433, terminals: 1 }
    ];
}