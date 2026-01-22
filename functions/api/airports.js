// Cloudflare Pages Function - UK Airports API
// Endpoint: /api/airports or /api/airports?search=london

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=86400' // Cache for 24 hours (static data)
};

export async function onRequest(context) {
    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(context.request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const iata = url.searchParams.get('iata')?.toUpperCase();
    const icao = url.searchParams.get('icao')?.toUpperCase();

    let airports = getUKAirports();

    // Filter by specific IATA code
    if (iata) {
        const airport = airports.find(a => a.iata === iata);
        if (airport) {
            return new Response(JSON.stringify({
                success: true,
                airport,
                timestamp: Date.now()
            }), { headers: CORS_HEADERS });
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: 'Airport not found',
                iata: iata
            }), { status: 404, headers: CORS_HEADERS });
        }
    }

    // Filter by specific ICAO code
    if (icao) {
        const airport = airports.find(a => a.icao === icao);
        if (airport) {
            return new Response(JSON.stringify({
                success: true,
                airport,
                timestamp: Date.now()
            }), { headers: CORS_HEADERS });
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: 'Airport not found',
                icao: icao
            }), { status: 404, headers: CORS_HEADERS });
        }
    }

    // Filter by search query
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
    }), { headers: CORS_HEADERS });
}

function getUKAirports() {
    return [
        {
            iata: 'LHR',
            icao: 'EGLL',
            name: 'London Heathrow Airport',
            city: 'London',
            country: 'United Kingdom',
            lat: 51.4700,
            lng: -0.4543,
            elevation: 83,
            timezone: 'Europe/London',
            terminals: ['Terminal 2', 'Terminal 3', 'Terminal 4', 'Terminal 5'],
            airlines: ['British Airways', 'Virgin Atlantic', 'American Airlines', 'United Airlines'],
            type: 'international',
            size: 'large',
            runways: 2,
            annualPassengers: 80000000
        },
        {
            iata: 'LGW',
            icao: 'EGKK',
            name: 'London Gatwick Airport',
            city: 'London',
            country: 'United Kingdom',
            lat: 51.1537,
            lng: -0.1821,
            elevation: 202,
            timezone: 'Europe/London',
            terminals: ['North Terminal', 'South Terminal'],
            airlines: ['easyJet', 'British Airways', 'Norwegian', 'WestJet'],
            type: 'international',
            size: 'large',
            runways: 2,
            annualPassengers: 46000000
        },
        {
            iata: 'STN',
            icao: 'EGSS',
            name: 'London Stansted Airport',
            city: 'London',
            country: 'United Kingdom',
            lat: 51.8860,
            lng: 0.2389,
            elevation: 348,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['Ryanair', 'Jet2', 'easyJet'],
            type: 'international',
            size: 'large',
            runways: 1,
            annualPassengers: 28000000
        },
        {
            iata: 'LTN',
            icao: 'EGGW',
            name: 'London Luton Airport',
            city: 'London',
            country: 'United Kingdom',
            lat: 51.8747,
            lng: -0.3683,
            elevation: 526,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['Wizz Air', 'easyJet', 'Ryanair', 'TUI'],
            type: 'international',
            size: 'medium',
            runways: 1,
            annualPassengers: 18000000
        },
        {
            iata: 'LCY',
            icao: 'EGLC',
            name: 'London City Airport',
            city: 'London',
            country: 'United Kingdom',
            lat: 51.5048,
            lng: 0.0495,
            elevation: 19,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['British Airways', 'KLM', 'Lufthansa'],
            type: 'international',
            size: 'small',
            runways: 1,
            annualPassengers: 5000000
        },
        {
            iata: 'SEN',
            icao: 'EGMC',
            name: 'London Southend Airport',
            city: 'London',
            country: 'United Kingdom',
            lat: 51.5714,
            lng: 0.6956,
            elevation: 49,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['Ryanair'],
            type: 'international',
            size: 'small',
            runways: 1,
            annualPassengers: 2000000
        },
        {
            iata: 'MAN',
            icao: 'EGCC',
            name: 'Manchester Airport',
            city: 'Manchester',
            country: 'United Kingdom',
            lat: 53.3537,
            lng: -2.2750,
            elevation: 257,
            timezone: 'Europe/London',
            terminals: ['Terminal 1', 'Terminal 2', 'Terminal 3'],
            airlines: ['Ryanair', 'easyJet', 'TUI', 'Jet2', 'Emirates'],
            type: 'international',
            size: 'large',
            runways: 2,
            annualPassengers: 29000000
        },
        {
            iata: 'BHX',
            icao: 'EGBB',
            name: 'Birmingham Airport',
            city: 'Birmingham',
            country: 'United Kingdom',
            lat: 52.4539,
            lng: -1.7480,
            elevation: 327,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['Ryanair', 'TUI', 'Jet2', 'Emirates'],
            type: 'international',
            size: 'medium',
            runways: 1,
            annualPassengers: 12500000
        },
        {
            iata: 'EDI',
            icao: 'EGPH',
            name: 'Edinburgh Airport',
            city: 'Edinburgh',
            country: 'United Kingdom',
            lat: 55.9508,
            lng: -3.3615,
            elevation: 135,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['Ryanair', 'easyJet', 'British Airways', 'Loganair'],
            type: 'international',
            size: 'medium',
            runways: 1,
            annualPassengers: 14700000
        },
        {
            iata: 'GLA',
            icao: 'EGPF',
            name: 'Glasgow Airport',
            city: 'Glasgow',
            country: 'United Kingdom',
            lat: 55.8719,
            lng: -4.4331,
            elevation: 26,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['easyJet', 'TUI', 'Jet2', 'Ryanair'],
            type: 'international',
            size: 'medium',
            runways: 1,
            annualPassengers: 9700000
        },
        {
            iata: 'BRS',
            icao: 'EGGD',
            name: 'Bristol Airport',
            city: 'Bristol',
            country: 'United Kingdom',
            lat: 51.3827,
            lng: -2.7190,
            elevation: 622,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['easyJet', 'TUI', 'Ryanair', 'Jet2'],
            type: 'international',
            size: 'medium',
            runways: 1,
            annualPassengers: 9000000
        },
        {
            iata: 'LPL',
            icao: 'EGGP',
            name: 'Liverpool John Lennon Airport',
            city: 'Liverpool',
            country: 'United Kingdom',
            lat: 53.3336,
            lng: -2.8497,
            elevation: 80,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['Ryanair', 'easyJet', 'Wizz Air'],
            type: 'international',
            size: 'medium',
            runways: 1,
            annualPassengers: 5000000
        },
        {
            iata: 'NCL',
            icao: 'EGNT',
            name: 'Newcastle Airport',
            city: 'Newcastle upon Tyne',
            country: 'United Kingdom',
            lat: 55.0375,
            lng: -1.6917,
            elevation: 266,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['easyJet', 'Ryanair', 'TUI', 'Jet2'],
            type: 'international',
            size: 'medium',
            runways: 1,
            annualPassengers: 5400000
        },
        {
            iata: 'LBA',
            icao: 'EGNM',
            name: 'Leeds Bradford Airport',
            city: 'Leeds',
            country: 'United Kingdom',
            lat: 53.8659,
            lng: -1.6606,
            elevation: 681,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['Jet2', 'Ryanair', 'Wizz Air'],
            type: 'international',
            size: 'medium',
            runways: 1,
            annualPassengers: 4000000
        },
        {
            iata: 'EMA',
            icao: 'EGNX',
            name: 'East Midlands Airport',
            city: 'Nottingham',
            country: 'United Kingdom',
            lat: 52.8311,
            lng: -1.3281,
            elevation: 306,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['Ryanair', 'TUI', 'Jet2'],
            type: 'international',
            size: 'medium',
            runways: 1,
            annualPassengers: 4900000
        },
        {
            iata: 'BFS',
            icao: 'EGAA',
            name: 'Belfast International Airport',
            city: 'Belfast',
            country: 'United Kingdom',
            lat: 54.6575,
            lng: -6.2158,
            elevation: 268,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['easyJet', 'Jet2', 'Ryanair', 'TUI'],
            type: 'international',
            size: 'medium',
            runways: 2,
            annualPassengers: 6300000
        },
        {
            iata: 'BHD',
            icao: 'EGAC',
            name: 'George Best Belfast City Airport',
            city: 'Belfast',
            country: 'United Kingdom',
            lat: 54.6181,
            lng: -5.8725,
            elevation: 15,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['British Airways', 'Aer Lingus', 'Loganair'],
            type: 'regional',
            size: 'small',
            runways: 1,
            annualPassengers: 2500000
        },
        {
            iata: 'ABZ',
            icao: 'EGPD',
            name: 'Aberdeen Airport',
            city: 'Aberdeen',
            country: 'United Kingdom',
            lat: 57.2019,
            lng: -2.1978,
            elevation: 215,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['British Airways', 'Loganair', 'easyJet', 'KLM'],
            type: 'international',
            size: 'medium',
            runways: 1,
            annualPassengers: 3100000
        },
        {
            iata: 'CWL',
            icao: 'EGFF',
            name: 'Cardiff Airport',
            city: 'Cardiff',
            country: 'United Kingdom',
            lat: 51.3967,
            lng: -3.3433,
            elevation: 220,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['TUI', 'Ryanair', 'Vueling'],
            type: 'international',
            size: 'small',
            runways: 1,
            annualPassengers: 1600000
        },
        {
            iata: 'SOU',
            icao: 'EGHI',
            name: 'Southampton Airport',
            city: 'Southampton',
            country: 'United Kingdom',
            lat: 50.9503,
            lng: -1.3568,
            elevation: 44,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['British Airways', 'Loganair', 'Aurigny'],
            type: 'regional',
            size: 'small',
            runways: 1,
            annualPassengers: 2000000
        },
        {
            iata: 'EXT',
            icao: 'EGTE',
            name: 'Exeter Airport',
            city: 'Exeter',
            country: 'United Kingdom',
            lat: 50.7344,
            lng: -3.4139,
            elevation: 102,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['Ryanair', 'TUI'],
            type: 'regional',
            size: 'small',
            runways: 1,
            annualPassengers: 1000000
        },
        {
            iata: 'NWI',
            icao: 'EGSH',
            name: 'Norwich Airport',
            city: 'Norwich',
            country: 'United Kingdom',
            lat: 52.6758,
            lng: 1.2828,
            elevation: 117,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['KLM', 'Loganair'],
            type: 'regional',
            size: 'small',
            runways: 1,
            annualPassengers: 500000
        },
        {
            iata: 'INV',
            icao: 'EGPE',
            name: 'Inverness Airport',
            city: 'Inverness',
            country: 'United Kingdom',
            lat: 57.5425,
            lng: -4.0475,
            elevation: 31,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['British Airways', 'easyJet', 'Loganair', 'KLM'],
            type: 'regional',
            size: 'small',
            runways: 1,
            annualPassengers: 1000000
        },
        {
            iata: 'JER',
            icao: 'EGJJ',
            name: 'Jersey Airport',
            city: 'St. Helier',
            country: 'Jersey',
            lat: 49.2078,
            lng: -2.1956,
            elevation: 277,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['British Airways', 'easyJet', 'Blue Islands'],
            type: 'regional',
            size: 'small',
            runways: 1,
            annualPassengers: 1700000
        },
        {
            iata: 'GCI',
            icao: 'EGJB',
            name: 'Guernsey Airport',
            city: 'St. Peter Port',
            country: 'Guernsey',
            lat: 49.4350,
            lng: -2.6020,
            elevation: 336,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['Aurigny', 'Blue Islands'],
            type: 'regional',
            size: 'small',
            runways: 1,
            annualPassengers: 900000
        },
        {
            iata: 'IOM',
            icao: 'EGNS',
            name: 'Isle of Man Airport',
            city: 'Douglas',
            country: 'Isle of Man',
            lat: 54.0833,
            lng: -4.6239,
            elevation: 52,
            timezone: 'Europe/London',
            terminals: ['Main Terminal'],
            airlines: ['easyJet', 'Loganair', 'British Airways'],
            type: 'regional',
            size: 'small',
            runways: 1,
            annualPassengers: 850000
        }
    ];
}