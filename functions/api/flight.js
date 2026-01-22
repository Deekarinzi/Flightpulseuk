// Cloudflare Pages Function - Single Flight Details API
// Endpoint: /api/flight?callsign=BA123

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=30'
};

export async function onRequest(context) {
    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(context.request.url);
    const callsign = url.searchParams.get('callsign');

    if (!callsign) {
        return new Response(JSON.stringify({ 
            success: false,
            error: 'Callsign parameter is required',
            example: '/api/flight?callsign=BA123'
        }), {
            status: 400,
            headers: CORS_HEADERS
        });
    }

    // Get detailed flight info
    const flightDetails = getFlightDetails(callsign.toUpperCase());
    
    if (!flightDetails) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Flight not found',
            callsign: callsign.toUpperCase()
        }), {
            status: 404,
            headers: CORS_HEADERS
        });
    }

    return new Response(JSON.stringify({
        success: true,
        flight: flightDetails,
        timestamp: Date.now()
    }), { headers: CORS_HEADERS });
}

function getFlightDetails(callsign) {
    const flights = {
        'BA123': {
            callsign: 'BA123',
            flightNumber: 'BA 123',
            airline: {
                name: 'British Airways',
                iata: 'BA',
                icao: 'BAW',
                logo: 'https://www.britishairways.com/assets/images/MediaHub/Media-Database/Logos/British-Airways-logo.png'
            },
            aircraft: {
                type: 'Boeing 777-300ER',
                registration: 'G-STBJ',
                age: '5 years',
                icao24: 'pqr678'
            },
            origin: {
                iata: 'LHR',
                icao: 'EGLL',
                name: 'London Heathrow',
                city: 'London',
                country: 'United Kingdom',
                terminal: '5',
                gate: 'B32',
                lat: 51.4700,
                lng: -0.4543
            },
            destination: {
                iata: 'JFK',
                icao: 'KJFK',
                name: 'John F. Kennedy International',
                city: 'New York',
                country: 'United States',
                terminal: '7',
                gate: '4',
                lat: 40.6413,
                lng: -73.7781
            },
            times: {
                scheduled: {
                    departure: '2024-01-15T11:45:00Z',
                    arrival: '2024-01-15T14:30:00Z'
                },
                actual: {
                    departure: '2024-01-15T11:47:00Z',
                    arrival: null
                },
                estimated: {
                    arrival: '2024-01-15T14:28:00Z'
                }
            },
            status: {
                code: 'EN_ROUTE',
                text: 'En Route',
                delay: 0,
                onTime: true
            },
            position: {
                lat: 53.2,
                lng: -4.8,
                altitude: 36000,
                altitudeUnit: 'ft',
                speed: 510,
                speedUnit: 'kts',
                heading: 275,
                verticalSpeed: 0,
                verticalSpeedUnit: 'fpm',
                squawk: '7421'
            },
            progress: {
                percentage: 65,
                elapsed: '4h 30m',
                remaining: '2h 15m',
                distance: {
                    total: 3451,
                    flown: 2243,
                    remaining: 1208,
                    unit: 'miles'
                }
            },
            history: {
                onTimeRating: 88,
                averageDelay: 8,
                delayUnit: 'minutes',
                lastFlights: [
                    { date: '2024-01-14', delay: 5, status: 'On Time' },
                    { date: '2024-01-13', delay: 0, status: 'On Time' },
                    { date: '2024-01-12', delay: 22, status: 'Delayed' },
                    { date: '2024-01-11', delay: 0, status: 'On Time' },
                    { date: '2024-01-10', delay: 3, status: 'On Time' }
                ]
            }
        },
        'BA458': {
            callsign: 'BA458',
            flightNumber: 'BA 458',
            airline: {
                name: 'British Airways',
                iata: 'BA',
                icao: 'BAW',
                logo: null
            },
            aircraft: {
                type: 'Airbus A320',
                registration: 'G-EUYT',
                age: '8 years',
                icao24: 'abc123'
            },
            origin: {
                iata: 'LHR',
                icao: 'EGLL',
                name: 'London Heathrow',
                city: 'London',
                country: 'United Kingdom',
                terminal: '5',
                gate: 'A10',
                lat: 51.4700,
                lng: -0.4543
            },
            destination: {
                iata: 'CDG',
                icao: 'LFPG',
                name: 'Charles de Gaulle',
                city: 'Paris',
                country: 'France',
                terminal: '2E',
                gate: 'K45',
                lat: 49.0097,
                lng: 2.5479
            },
            times: {
                scheduled: {
                    departure: '2024-01-15T14:15:00Z',
                    arrival: '2024-01-15T16:35:00Z'
                },
                actual: {
                    departure: '2024-01-15T14:18:00Z',
                    arrival: null
                },
                estimated: {
                    arrival: '2024-01-15T16:38:00Z'
                }
            },
            status: {
                code: 'EN_ROUTE',
                text: 'En Route',
                delay: 3,
                onTime: true
            },
            position: {
                lat: 51.15,
                lng: -0.18,
                altitude: 36000,
                altitudeUnit: 'ft',
                speed: 450,
                speedUnit: 'kts',
                heading: 135,
                verticalSpeed: 0,
                verticalSpeedUnit: 'fpm',
                squawk: '5523'
            },
            progress: {
                percentage: 67,
                elapsed: '0h 52m',
                remaining: '1h 10m',
                distance: {
                    total: 214,
                    flown: 143,
                    remaining: 71,
                    unit: 'miles'
                }
            },
            history: {
                onTimeRating: 92,
                averageDelay: 5,
                delayUnit: 'minutes',
                lastFlights: []
            }
        },
        'BA217': {
            callsign: 'BA217',
            flightNumber: 'BA 217',
            airline: {
                name: 'British Airways',
                iata: 'BA',
                icao: 'BAW',
                logo: null
            },
            aircraft: {
                type: 'Boeing 777-200',
                registration: 'G-VIIA',
                age: '12 years',
                icao24: 'def456'
            },
            origin: {
                iata: 'LHR',
                icao: 'EGLL',
                name: 'London Heathrow',
                city: 'London',
                country: 'United Kingdom',
                terminal: '5',
                gate: 'C44',
                lat: 51.4700,
                lng: -0.4543
            },
            destination: {
                iata: 'IAD',
                icao: 'KIAD',
                name: 'Washington Dulles',
                city: 'Washington',
                country: 'United States',
                terminal: 'B',
                gate: '12',
                lat: 38.9531,
                lng: -77.4565
            },
            times: {
                scheduled: {
                    departure: '2024-01-15T10:30:00Z',
                    arrival: '2024-01-15T14:15:00Z'
                },
                actual: {
                    departure: '2024-01-15T10:32:00Z',
                    arrival: null
                },
                estimated: {
                    arrival: '2024-01-15T14:12:00Z'
                }
            },
            status: {
                code: 'EN_ROUTE',
                text: 'En Route',
                delay: 0,
                onTime: true
            },
            position: {
                lat: 51.8,
                lng: -1.2,
                altitude: 38000,
                altitudeUnit: 'ft',
                speed: 510,
                speedUnit: 'kts',
                heading: 285,
                verticalSpeed: 0,
                verticalSpeedUnit: 'fpm',
                squawk: '6142'
            },
            progress: {
                percentage: 45,
                elapsed: '3h 15m',
                remaining: '2h 45m',
                distance: {
                    total: 3665,
                    flown: 1649,
                    remaining: 2016,
                    unit: 'miles'
                }
            },
            history: {
                onTimeRating: 85,
                averageDelay: 12,
                delayUnit: 'minutes',
                lastFlights: []
            }
        },
        'VS3': {
            callsign: 'VS3',
            flightNumber: 'VS 3',
            airline: {
                name: 'Virgin Atlantic',
                iata: 'VS',
                icao: 'VIR',
                logo: null
            },
            aircraft: {
                type: 'Airbus A350-1000',
                registration: 'G-VLUX',
                age: '3 years',
                icao24: 'ghi789'
            },
            origin: {
                iata: 'LHR',
                icao: 'EGLL',
                name: 'London Heathrow',
                city: 'London',
                country: 'United Kingdom',
                terminal: '3',
                gate: 'B36',
                lat: 51.4700,
                lng: -0.4543
            },
            destination: {
                iata: 'JFK',
                icao: 'KJFK',
                name: 'John F. Kennedy International',
                city: 'New York',
                country: 'United States',
                terminal: '4',
                gate: 'B25',
                lat: 40.6413,
                lng: -73.7781
            },
            times: {
                scheduled: {
                    departure: '2024-01-15T11:00:00Z',
                    arrival: '2024-01-15T14:15:00Z'
                },
                actual: {
                    departure: '2024-01-15T11:15:00Z',
                    arrival: null
                },
                estimated: {
                    arrival: '2024-01-15T14:30:00Z'
                }
            },
            status: {
                code: 'EN_ROUTE',
                text: 'En Route - Delayed',
                delay: 15,
                onTime: false
            },
            position: {
                lat: 52.1,
                lng: -2.5,
                altitude: 40000,
                altitudeUnit: 'ft',
                speed: 520,
                speedUnit: 'kts',
                heading: 270,
                verticalSpeed: 0,
                verticalSpeedUnit: 'fpm',
                squawk: '4521'
            },
            progress: {
                percentage: 35,
                elapsed: '2h 45m',
                remaining: '3h 15m',
                distance: {
                    total: 3451,
                    flown: 1208,
                    remaining: 2243,
                    unit: 'miles'
                }
            },
            history: {
                onTimeRating: 78,
                averageDelay: 18,
                delayUnit: 'minutes',
                lastFlights: []
            }
        }
    };

    return flights[callsign] || null;
}