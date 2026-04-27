'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Chart,
    ArcElement,
    DoughnutController,
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import Link from 'next/link';
import './styles.css';
import StudentStatistics from './components/StudentStatistics';
import ProgramDistribution from './components/ProgramDistribution';
import StatisticsOfCollege from './components/StatisticsOfCollege';
import FeeStructure from './components/FeeStructure';


Chart.register(
    ArcElement,
    DoughnutController,
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler
);


interface FeeGroup {
    per_year: string;
    total_course: string;
    currency: string;
}

interface FeesInfo {
    UG: FeeGroup;
    PG: FeeGroup;
    PhD: FeeGroup;
    hostel_per_year: string;
    ug_yearly_min?: number;
    ug_yearly_max?: number;
    pg_yearly_min?: number;
    pg_yearly_max?: number;
    phd_yearly_min?: number;
    phd_yearly_max?: number;
}

interface FeesYearInfo {
    year: number;
    UG: FeeGroup;
    PG: FeeGroup;
    PhD: FeeGroup;
    hostel_per_year: number;
}

interface GenderRatio {
    male_percentage: number;
    female_percentage: number;
}

interface GenderRatioDetail {
    total_male: number;
    total_female: number;
    male_percent: number;
    female_percent: number;
}

interface StatisticItem {
    category: string;
    value: any;
}

interface CollegeRankings {
    nirf_2025?: any;
    nirf_2024?: any;
    qs_world?: any;
    qs_asia?: any;
    the_world?: any;
    national_rank?: any;
    state_rank?: any;
}

interface StudentStatsDetail {
    total_enrollment: number;
    ug_students: number;
    pg_students: number;
    phd_students: number;
    male_students: number;
    female_students: number;
    [key: string]: any;
}

interface FacultyStaffDetail {
    total_faculty: number;
    student_faculty_ratio: number;
    phd_faculty_percent: number;
}

interface PlacementInfo {
    year: number;
    highest_package: number;
    average_package: number;
    median_package: number;
    package_currency: string;
    placement_rate_percent: number;
    total_students_placed: number;
    total_companies_visited: number;
    graduate_outcomes_note: string;
}

interface PlacementComp {
    year: number;
    average_package: number;
    employment_rate_percent: number;
    package_currency: string;
}

interface GenderPlacement {
    year: number;
    male_placed: any;
    female_placed: any;
    male_percent: any;
    female_percent: any;
}

interface SectorPlacement {
    year: number;
    sector: string;
    companies: string;
    percent: any;
}

interface ScholarshipItem {
    name: string;
    amount: number;
    currency_type: string;
    eligibility: string;
    provider: string;
    type?: string;
    application_deadline?: string;
}

interface InfraItem {
    facility: string;
    details: string;
}

interface HostelDetails {
    available: boolean;
    boys_capacity: any;
    girls_capacity: any;
    total_capacity: any;
    type: string;
}

interface LibraryDetails {
    total_books: string;
    journals: string;
    e_resources: string;
    area_sqft: string;
}

interface TransportDetails {
    buses: string;
    routes: string;
}

interface StudentCountEntry {
    year: number;
    total_enrolled: number;
    ug: number;
    pg: number;
    phd: number;
}

interface StudentHistory {
    student_count_comparison_last_3_years: StudentCountEntry[];
    student_gender_ratio: GenderRatioDetail;
    international_students: { total_count: number; countries_represented: string[]; international_percent: number };
    notable_faculty: { name: string; designation: string; specialization: string }[];
    faculty_achievements: string;
}

interface Accreditation {
    body: string;
    grade: any;
    year: any;
}

interface ContactInfo {
    phone: string;
    email: string;
    address: string;
}

interface CollegeData {
    college_name: string;
    short_name?: string;
    established?: number;
    institution_type?: string;
    country: string;
    about: string;
    location: string;
    website?: string;
    summary: string;
    ug_programs: string[];
    pg_programs: string[];
    phd_programs: string[];

    rankings?: CollegeRankings;
    student_statistics_detail?: StudentStatsDetail;
    faculty_staff_detail?: FacultyStaffDetail;
    placements?: PlacementInfo;
    placement_comparison_last_3_years?: PlacementComp[];
    gender_based_placement_last_3_years?: GenderPlacement[];
    sector_wise_placement_last_3_years?: SectorPlacement[];
    top_recruiters?: string[];
    placement_highlights?: string;

    fees: FeesInfo;
    fees_by_year?: FeesYearInfo[];
    fees_note?: string;
    scholarships_detail?: ScholarshipItem[];

    infrastructure?: InfraItem[];
    hostel_details?: HostelDetails;
    library_details?: LibraryDetails;
    transport_details?: TransportDetails;

    student_history?: StudentHistory;
    accreditations?: Accreditation[];
    affiliations?: string[];
    recognition?: string;
    campus_area?: string;
    contact_info?: ContactInfo;

    // Legacy/compat
    scholarships?: string[];
    student_gender_ratio: GenderRatio;
    faculty_staff: number;
    international_students: number;
    global_ranking: string | { qs_world?: any; the_world?: any; us_news_global?: any; arwu?: any; webometrics?: any };
    departments: string[];
    student_statistics: StatisticItem[];
    additional_details: StatisticItem[];
    sources: string[];
    approval_status: string;
}

// PSG COLLEGE OF TECHNOLOGY DATA - From normalized JSON
const SAMPLE_COLLEGE_DATA: CollegeData = {
    college_name: "PSG College of Technology",
    short_name: "PSGCT",
    established: 1951,
    institution_type: "Public-Private Partnership (Government Aided), Autonomous",
    country: "India",
    about: "PSG College of Technology, established in 1951 by PSG & Sons' Charities, is a premier government-aided autonomous engineering institution located in Coimbatore, India. It is known for its strong industry-academic interface and research focus.",
    location: "Coimbatore, Tamil Nadu",
    website: "https://psgtech.edu",
    summary: "PSGCT is a top-tier engineering college in India, consistently ranked among the best by NIRF and other agencies. It offers a wide range of undergraduate and postgraduate programs in engineering, technology, and management.",
    ug_programs: [
        "B.E. Automobile Engineering",
        "B.E. Biomedical Engineering",
        "B.E. Civil Engineering",
        "B.E. Computer Science and Engineering",
        "B.E. Computer Science and Engineering (AI and ML)",
        "B.E. Electrical and Electronics Engineering",
        "B.E. Electrical and Electronics Engineering (Sandwich)",
        "B.E. Electronics and Communication Engineering",
        "B.E. Instrumentation and Control Engineering",
        "B.E. Mechanical Engineering",
        "B.E. Mechanical Engineering (Sandwich)",
        "B.E. Metallurgical Engineering",
        "B.E. Production Engineering",
        "B.E. Production Engineering (Sandwich)",
        "B.E. Robotics and Automation",
        "B.Tech. Bio Technology",
        "B.Tech. Fashion Technology",
        "B.Tech. Information Technology",
        "B.Tech. Textile Technology",
        "B.Sc. Applied Science",
        "B.Sc. Computer Systems and Design",
        "M.Sc. Fashion Design & Merchandising (5 Year Integrated)",
        "M.Sc. Software Systems (5 Year Integrated)",
        "M.Sc. Theoretical Computer Science (5 Year Integrated)",
        "M.Sc. Data Science (5 Year Integrated)",
        "M.Sc. Cyber Security (5 Year Integrated)"
    ],
    pg_programs: [
        "M.E. Automotive Engineering",
        "M.E. Biometrics and Cybersecurity",
        "M.E. Computer Science and Engineering",
        "M.E. Control Systems",
        "M.E. Embedded & Real-Time Systems",
        "M.E. Engineering Design",
        "M.E. Industrial Engineering",
        "M.E. Manufacturing Engineering",
        "M.E. Power Electronics and Drives",
        "M.E. Structural Engineering",
        "M.E. VLSI Design",
        "M.Tech. Bio Technology",
        "M.Tech. Nano Science and Technology",
        "M.Tech. Textile Technology",
        "M.Sc. Applied Mathematics",
        "Master of Computer Applications (MCA)",
        "Master of Business Administration (MBA)",
        "MBA (Waste Management & Social Entrepreneurship)",
        "M.Sc. Software Systems (5 Years Integrated)",
        "M.Sc. Theoretical Computer Science (5 Years Integrated)",
        "M.Sc. Data Science (5 Years Integrated)",
        "M.Sc. Cyber Security (5 Years Integrated)",
        "M.Sc. Fashion Design & Merchandising (5 Years Integrated)",
        "M.Sc. Computational Finance (5 Years Integrated)"
    ],
    phd_programs: [
        "Applied Sciences",
        "Chemistry",
        "Civil Engineering",
        "Computer Applications",
        "Computer Science and Engineering",
        "Electrical and Electronics Engineering",
        "Electronics and Communication Engineering",
        "Engineering and Technology",
        "Humanities",
        "Management Sciences",
        "Mathematics and Computer Science",
        "Mechanical Engineering",
        "Metallurgical Engineering",
        "Metallurgical and Materials Engineering",
        "Robotics and Automation",
        "Textile Technology"
    ],
    
    rankings: {
        nirf_2025: "67 (Engineering)",
        qs_world: "751-800",
        national_rank: "67",
        state_rank: "11"
    },
    
    student_statistics_detail: {
        total_enrollment: 8518,
        ug_students: 7695,
        pg_students: 505,
        phd_students: 318,
        male_students: 5622,
        female_students: 2896,
        annual_intake: 1434,
        male_percent: 66.0,
        female_percent: 34.0,
        total_ug_courses: 21,
        total_pg_courses: 24,
        total_phd_courses: 15
    },
    
    faculty_staff_detail: {
        total_faculty: 491,
        student_faculty_ratio: 14.0,
        phd_faculty_percent: 72.0
    },
    
    placements: {
        year: 2024,
        highest_package: 6040000,
        average_package: 812000,
        median_package: 724000,
        package_currency: "INR",
        placement_rate_percent: 80.6,
        total_students_placed: 831,
        total_companies_visited: 460,
        graduate_outcomes_note: "Data reflects undergraduate 4-year engineering programs. Highest package reached 60.4 LPA from top-tier tech firms."
    },
    
    placement_comparison_last_3_years: [
        { year: 2024, average_package: 812000, employment_rate_percent: 80.6, package_currency: "INR" },
        { year: 2023, average_package: 679000, employment_rate_percent: 79.0, package_currency: "INR" },
        { year: 2022, average_package: 709000, employment_rate_percent: 78.0, package_currency: "INR" }
    ],
    
    gender_based_placement_last_3_years: [
        { year: 2024, male_placed: -1, female_placed: -1, male_percent: -1, female_percent: -1 }
    ],
    
    sector_wise_placement_last_3_years: [
        { year: 2024, sector: "Core Engineering & IT", companies: "Texas Instruments, Qualcomm, Caterpillar, Bosch, Oracle", percent: 80.0 }
    ],
    
    top_recruiters: ["Google", "Microsoft", "Amazon", "Texas Instruments", "Qualcomm", "Oracle", "Bosch", "TCS", "Caterpillar"],
    placement_highlights: "PSG Tech maintained a robust placement record with a median salary of 7.24 LPA for the 2023-24 cycle and a peak package of 60.4 LPA. Over 460 companies participated in the drive, with IT and core electronics branches like ECE and CSE seeing high demand.",
    
    fees: {
        UG: { per_year: "55000", total_course: "220000", currency: "INR" },
        PG: { per_year: "30000", total_course: "60000", currency: "INR" },
        PhD: { per_year: "14000", total_course: "42000", currency: "INR" },
        hostel_per_year: "140000"
    },
    
    fees_by_year: [
        { year: 2026, UG: { per_year: "55000", total_course: "220000", currency: "INR" }, PG: { per_year: "30000", total_course: "60000", currency: "INR" }, PhD: { per_year: "14000", total_course: "42000", currency: "INR" }, hostel_per_year: 140000 },
        { year: 2025, UG: { per_year: "55000", total_course: "220000", currency: "INR" }, PG: { per_year: "30000", total_course: "60000", currency: "INR" }, PhD: { per_year: "14000", total_course: "42000", currency: "INR" }, hostel_per_year: 140000 },
        { year: 2024, UG: { per_year: "55000", total_course: "220000", currency: "INR" }, PG: { per_year: "30000", total_course: "60000", currency: "INR" }, PhD: { per_year: "14000", total_course: "42000", currency: "INR" }, hostel_per_year: 103000 }
    ],
    
    fees_note: "Fees for UG and PG engineering programs remain largely stable as per state fee committee norms, with accredited courses typically costing an additional INR 5,000–10,000 per year. Self-supporting and management quota seats incur significantly higher costs, sometimes reaching up to INR 85,000–90,000 annually. Hostel fees have seen a rise, with standard 1st-year accommodation now approximately INR 1.40 Lakhs.",
    
    scholarships_detail: [
        { name: "PSG Tech Alumni Association Scholarship", amount: -1, currency_type: "INR", eligibility: "Deserving Diploma and UG students with merit; requires academic records and parent income certificate.", provider: "PSG Tech Alumni Association" },
        { name: "Post-matric Scholarships for Students with Disabilities", amount: 190000, currency_type: "INR", eligibility: "Minimum 40% disability with valid certificate.", provider: "Central Government" },
        { name: "First Graduate Scholarship", amount: 27500, currency_type: "INR", eligibility: "Students who are the first graduates in their family; applies to tuition fees.", provider: "Tamil Nadu State Government" },
        { name: "Sitaram Jindal Foundation Scholarship", amount: -1, currency_type: "INR", eligibility: "Open to all communities; merit-cum-means based.", provider: "Sitaram Jindal Foundation" }
    ],
    
    infrastructure: [
        { facility: "Centres of Excellence", details: "Includes CoE in Welding, InduTech, TIFAC, and CNC Engineering for industry-institute interaction." },
        { facility: "Computing Facilities", details: "Campus-wide LAN with 20G uplinks and 1 Gbps primary bandwidth through NKN; redundant data centers." },
        { facility: "Sports Complex", details: "Facilities for tennis, indoor games, gymnasiums, and multiple play fields." },
        { facility: "PSG STEP", details: "Science & Technology Entrepreneurial Park providing mentorship and startup infrastructure." }
    ],
    
    hostel_details: {
        available: true,
        boys_capacity: 3500,
        girls_capacity: 3439,
        total_capacity: 6939,
        type: "Separate male and female hostels with varying sharing options (2, 3, 4, 6, 8 sharing)."
    },
    
    library_details: {
        total_books: "260000",
        journals: "195",
        e_resources: "2019",
        area_sqft: "30000"
    },
    
    transport_details: {
        buses: "0",
        routes: "0"
    },
    
    student_history: {
        student_count_comparison_last_3_years: [
            { year: 2026, total_enrolled: 8518, ug: 7695, pg: 505, phd: 318 },
            { year: 2025, total_enrolled: 8518, ug: 7695, pg: 505, phd: 318 },
            { year: 2024, total_enrolled: 8400, ug: 7500, pg: 600, phd: 300 }
        ],
        student_gender_ratio: {
            total_male: 5622,
            total_female: 2896,
            male_percent: 66,
            female_percent: 34
        },
        international_students: {
            total_count: 0,
            countries_represented: [],
            international_percent: 0
        },
        notable_faculty: [],
        faculty_achievements: ""
    },
    
    accreditations: [
        { body: "NAAC", grade: "A++", year: 2024 },
        { body: "NBA", grade: "Accredited (Multiple Programs)", year: 2023 }
    ],
    
    affiliations: ["Anna University, Chennai"],
    recognition: "AICTE, UGC (Autonomous Status)",
    campus_area: "45 acres",
    
    contact_info: {
        phone: "+91-422-2572177",
        email: "principal@psgtech.ac.in",
        address: "Avinashi Road, Peelamedu, Coimbatore - 641004, Tamil Nadu, India"
    },
    
    // Legacy/compat
    scholarships: ["PSG Tech Alumni Association Scholarship", "Post-matric Scholarships for Students with Disabilities", "First Graduate Scholarship", "Sitaram Jindal Foundation Scholarship"],
    student_gender_ratio: { male_percentage: 66, female_percentage: 34 },
    faculty_staff: 491,
    international_students: 0,
    global_ranking: { qs_world: "751-800", the_world: "751-800" },
    departments: ["Automobile Engineering", "Biomedical Engineering", "Civil Engineering", "Computer Science and Engineering", "Electrical and Electronics Engineering", "Electronics and Communication Engineering", "Instrumentation and Control Engineering", "Mechanical Engineering", "Metallurgical Engineering", "Production Engineering", "Robotics and Automation", "Bio Technology", "Fashion Technology", "Information Technology", "Textile Technology", "Applied Science", "Computer Systems and Design"],
    student_statistics: [
        { category: "Total students", value: 8518 },
        { category: "Faculty", value: 491 }
    ],
    additional_details: [
        { category: "Campus", value: "45 acres" },
        { category: "Library", value: "260000 books" }
    ],
    sources: ["https://psgtech.edu", "https://www.shiksha.com/college/psgct-coimbatore-19398/ranking", "https://www.careers360.com/colleges/psg-college-of-technology-coimbatore", "https://www.nirfindia.org/Rankings/2025/EngineeringRanking.html"],
    approval_status: "approved"
};

export default function CollegeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const collegeName = decodeURIComponent(params.name as string);

    const [collegeData, setCollegeData] = useState<CollegeData | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedStatCategory, setSelectedStatCategory] = useState<string | null>(null);
    const [selectedPlacementYear, setSelectedPlacementYear] = useState<string>('all');
    const [selectedPlacementGender, setSelectedPlacementGender] = useState<string>('all');

    const genderChartRef = useRef<Chart | null>(null);
    const placementChartRef = useRef<Chart | null>(null);

    const createGenderChart = () => {
        const canvas = document.getElementById('genderChart') as HTMLCanvasElement;
        if (!canvas || !collegeData) return;
        if (genderChartRef.current) genderChartRef.current.destroy();

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const sh = collegeData.student_history?.student_gender_ratio;
        const legacy = collegeData.student_gender_ratio;
        const maleP = sh?.male_percent || legacy?.male_percentage || 50;
        const femaleP = sh?.female_percent || legacy?.female_percentage || 50;

        genderChartRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Male', 'Female'],
                datasets: [
                    {
                        data: [maleP, femaleP],
                        backgroundColor: ['#070642', '#9a3197'],
                        borderWidth: 0,
                        hoverOffset: 15,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                },
            },
        });
    };

    const createPlacementChart = () => {
        const canvas = document.getElementById('placementChart') as HTMLCanvasElement;
        if (!canvas || !collegeData) return;
        if (placementChartRef.current) placementChartRef.current.destroy();

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const compData = collegeData.placement_comparison_last_3_years || [];
        const genderData = collegeData.gender_based_placement_last_3_years || [];
        
        // Filter data based on selected year
        let filteredData = compData;
        let filteredGenderData = genderData;
        if (selectedPlacementYear !== 'all') {
            filteredData = compData.filter(c => String(c.year) === selectedPlacementYear);
            filteredGenderData = genderData.filter(c => String(c.year) === selectedPlacementYear);
        }
        
        const labels = filteredData.map(c => String(c.year));
        const avgPkgs = filteredData.map(c => c.average_package || 0);
        const empRates = filteredData.map(c => c.employment_rate_percent || 0);

        const initialAvgPkgs = avgPkgs.length > 0 ? avgPkgs.map(v => v >= 100000 ? +(v / 100000).toFixed(2) : v) : [0];
        const initialEmpRates = empRates.length > 0 ? empRates : [0];

        // Prepare datasets based on gender filter
        let datasets: any[] = [];
        
        if (genderData.length > 0 && selectedPlacementGender !== 'all') {
            // Show gender-specific placement percentages
            const malePercents = filteredGenderData.map(c => {
                const val = selectedPlacementGender === 'male' ? c.male_percent : 0;
                return (val === -1 || val === undefined || val === null) ? 50 : val;
            });
            const femalePercents = filteredGenderData.map(c => {
                const val = selectedPlacementGender === 'female' ? c.female_percent : 0;
                return (val === -1 || val === undefined || val === null) ? 50 : val;
            });
            
            datasets = [
                {
                    label: selectedPlacementGender === 'male' ? 'Male Placement %' : 'Female Placement %',
                    data: (selectedPlacementGender === 'male' ? malePercents : femalePercents).map(() => 0),
                    backgroundColor: selectedPlacementGender === 'male' ? '#070642' : '#9a3197',
                    borderRadius: 8,
                    yAxisID: 'y',
                },
            ];
        } else {
            // Show overall data
            datasets = [
                {
                    label: 'Avg Package (LPA)',
                    data: initialAvgPkgs.map(() => 0),
                    backgroundColor: '#070642',
                    borderRadius: 8,
                    yAxisID: 'y',
                },
                {
                    label: 'Employment Rate %',
                    data: initialEmpRates.map(() => 0),
                    backgroundColor: '#9a3197',
                    borderRadius: 8,
                    yAxisID: 'y1',
                },
            ];
        }

        placementChartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length > 0 ? labels : ['No Data'],
                datasets: datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2500,
                    easing: 'easeInOutQuart' as const,
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                },
                scales: {
                    y: { beginAtZero: true, position: 'left', max: 100, grid: { color: 'rgba(0,0,0,0.05)' }, title: { display: true, text: genderData.length > 0 && selectedPlacementGender !== 'all' ? '%' : 'Package' } },
                    x: { grid: { display: false } },
                },
            },
        });

        // Animate from 0 to actual values
        setTimeout(() => {
            if (placementChartRef.current) {
                if (genderData.length > 0 && selectedPlacementGender !== 'all') {
                    const filteredGenderData2 = selectedPlacementYear === 'all' 
                        ? genderData 
                        : genderData.filter(c => String(c.year) === selectedPlacementYear);
                    
                    const malePercents = filteredGenderData2.map(c => {
                        const val = c.male_percent;
                        return (val === -1 || val === undefined || val === null) ? 50 : val;
                    });
                    const femalePercents = filteredGenderData2.map(c => {
                        const val = c.female_percent;
                        return (val === -1 || val === undefined || val === null) ? 50 : val;
                    });
                    
                    placementChartRef.current.data.datasets[0].data = selectedPlacementGender === 'male' ? malePercents : femalePercents;
                } else {
                    placementChartRef.current.data.datasets[0].data = initialAvgPkgs;
                    placementChartRef.current.data.datasets[1].data = initialEmpRates;
                }
                placementChartRef.current.update();
            }
        }, 100);
    };

    // Load sample data on mount
    useEffect(() => {
        setCollegeData(SAMPLE_COLLEGE_DATA);
        if (SAMPLE_COLLEGE_DATA.departments && SAMPLE_COLLEGE_DATA.departments.length > 0) {
            setSelectedDepartment(SAMPLE_COLLEGE_DATA.departments[0]);
        }
    }, []);

    useEffect(() => {
        if (collegeData && activeTab === 'overview') {
            setTimeout(() => {
                createGenderChart();
            }, 300);
        }
        if (collegeData && activeTab === 'placements') {
            setTimeout(() => {
                createPlacementChart();
            }, 300);
        }

        return () => {
            if (genderChartRef.current) genderChartRef.current.destroy();
            if (placementChartRef.current) placementChartRef.current.destroy();
        };
    }, [collegeData, activeTab, selectedPlacementYear, selectedPlacementGender]);

    // --- Helper Utilities ---
    const formatValue = (val: any): string => {
        if (val === null || val === undefined || val === '' || val === 0) return '-';
        if (val === -1) return 'Not Available';
        if (typeof val === 'object') return JSON.stringify(val);
        if (typeof val === 'number') return val.toLocaleString();
        return String(val);
    };

    const formatPackage = (amount: number, currency: string = 'INR'): string => {
        if (!amount || amount === -1) return 'Not Available';
        const sym = currency === 'USD' ? '$' : '₹';
        if (currency === 'USD') return `${sym}${amount.toLocaleString()}`;
        if (amount >= 100000) return `${sym}${(amount / 100000).toFixed(2)} LPA`;
        return `${sym}${amount.toLocaleString()}`;
    };

    const formatCurrency = (amount: any, currency: string = '₹'): string => {
        if (!amount || amount === -1) return 'Not Available';
        if (typeof amount === 'string') return amount; // Already formatted string from FeeGroup
        if (typeof amount === 'number') {
            if (amount >= 100000) return `${currency}${(amount / 100000).toFixed(1)}L`;
            return `${currency}${amount.toLocaleString()}`;
        }
        return String(amount);
    };

    // Legacy helpers (fallback)
    const getStat = (category: string) => {
        if (!Array.isArray(collegeData?.student_statistics)) return 0;
        const stat = collegeData?.student_statistics?.find((s) =>
            s.category.toLowerCase().includes(category.toLowerCase())
        );
        const val = stat?.value;
        if (val === null || val === undefined) return 0;
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
    };

    const getDetail = (keyword: string): any => {
        if (!Array.isArray(collegeData?.additional_details)) return '-';
        const detail = collegeData?.additional_details?.find((d) =>
            d.category.toLowerCase().includes(keyword.toLowerCase())
        );
        const val = detail?.value;
        if (val === null || val === undefined) return '-';
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
    };

    if (!collegeData) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading College Data...</p>
            </div>
        );
    }

    return (
        <div className="college-details-page">
            { }
            <section className="hero-section">
                <div className="hero-content">
                    <Link href="/" className="back-link">
                        ← Back to Home
                    </Link>
                    <h1 className="college-name">
                        {collegeData.college_name}
                    </h1>
                    <p className="college-location">
                        📍 {collegeData.location}, {collegeData.country}
                    </p>
                    <p className="college-summary">{collegeData.summary || collegeData.about}</p>

                    { }
                    <div className="quick-stats">
                        {/* Core Stats */}
                        <div className="stat-card">
                            <span className="stat-icon">👨‍🎓</span>
                            <span className="stat-value">{collegeData.student_statistics_detail?.total_enrollment?.toLocaleString() || (getStat('Total students') || '-')}</span>
                            <span className="stat-label">Total Students</span>
                        </div>

                        {/* Rankings - Dynamic Cards */}
                        {(() => {
                            const isRealRank = (v: any) => v !== null && v !== undefined && v !== '' && v !== 0 && v !== 'N/A' && v !== 'N/a' && v !== 'n/a';
                            const rk = collegeData.rankings || {};
                            const rankingCards = [
                                { label: 'QS World', value: rk.qs_world, icon: '🌍' },
                                { label: 'THE World', value: rk.the_world, icon: '📊' },
                                { label: 'National Rank', value: rk.national_rank, icon: '🏆' },
                                { label: 'State Rank', value: rk.state_rank, icon: '📍' },
                            ].filter(c => isRealRank(c.value));

                            return rankingCards.map((card, idx) => (
                                <div className="stat-card" key={`rank-${idx}`}>
                                    <span className="stat-icon">{card.icon}</span>
                                    <span className="stat-value">{formatValue(card.value)}</span>
                                    <span className="stat-label">{card.label}</span>
                                </div>
                            ));
                        })()}

                        {/* Other Stats */}
                        <div className="stat-card">
                            <span className="stat-icon">🌍</span>
                            <span className="stat-value">{collegeData.student_history?.international_students?.total_count || collegeData.international_students || '-'}</span>
                            <span className="stat-label">International</span>
                        </div>

                        {collegeData.faculty_staff_detail?.total_faculty && (
                            <div className="stat-card">
                                <span className="stat-icon">👨‍🏫</span>
                                <span className="stat-value">{collegeData.faculty_staff_detail.total_faculty}</span>
                                <span className="stat-label">Faculty</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            { }
            <div className="tabs-container">
                <div className="tabs">
                    {['overview', 'programs', 'departments', 'placements', 'fees'].map((tab) => (
                        <button
                            key={tab}
                            className={`tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            { }
            <main className="main-content">
                { }
                {activeTab === 'overview' && (
                    <div className="tab-content">
                        { /* About */ }
                        <section className="content-section">
                            <h2 className="section-title">About {collegeData.college_name}</h2>
                            <p className="about-text">{collegeData.about || collegeData.summary}</p>
                        </section>

                        { /* Quick Facts Table */ }
                        {(collegeData.established || collegeData.institution_type || collegeData.campus_area || collegeData.website || (collegeData.accreditations && collegeData.accreditations.length > 0) || (collegeData.affiliations && collegeData.affiliations.length > 0) || collegeData.recognition) && (
                            <section className="content-section">
                                <h2 className="section-title">🏫 Quick Facts</h2>
                                <table className="data-table">
                                    <thead><tr><th>Detail</th><th>Value</th></tr></thead>
                                    <tbody>
                                        {collegeData.established ? <tr><td>Established</td><td>{collegeData.established}</td></tr> : null}
                                        {collegeData.institution_type ? <tr><td>Institution Type</td><td>{collegeData.institution_type}</td></tr> : null}
                                        {collegeData.campus_area ? <tr><td>Campus Area</td><td>{collegeData.campus_area}</td></tr> : null}
                                        {collegeData.recognition ? <tr><td>Recognition</td><td>{collegeData.recognition}</td></tr> : null}
                                        {collegeData.accreditations && collegeData.accreditations.length > 0 ? (
                                            <tr><td>Accreditations</td><td>{collegeData.accreditations.map(a => `${a.body}${a.grade ? ` (${a.grade})` : ''}${a.year ? ` - ${a.year}` : ''}`).join(', ')}</td></tr>
                                        ) : null}
                                        {collegeData.affiliations && collegeData.affiliations.length > 0 ? (
                                            <tr><td>Affiliations</td><td>{Array.isArray(collegeData.affiliations) ? collegeData.affiliations.join(', ') : collegeData.affiliations}</td></tr>
                                        ) : null}
                                        {collegeData.website ? <tr><td>Website</td><td><a href={collegeData.website.startsWith('http') ? collegeData.website : `https://${collegeData.website}`} target="_blank" rel="noopener noreferrer" className="source-link">{collegeData.website}</a></td></tr> : null}
                                    </tbody>
                                </table>
                            </section>
                        )}

                        {/* Statistics of College Section */}
                        <StatisticsOfCollege
                            studentStatistics={collegeData.student_statistics_detail}
                            facultyStaff={collegeData.faculty_staff_detail}
                            collegeName={collegeData.college_name}
                        />

                        <StudentStatistics
                            studentHistory={collegeData.student_history}
                            collegeName={collegeData.college_name}
                        />

                        { /* Visual Analytics */ }
                        <section className="content-section">
                            <h2 className="section-title">📈 Visual Analytics</h2>
                            <div className="charts-grid">
                                <div className="chart-card">
                                    <h3>Gender Distribution</h3>
                                    <div className="chart-wrapper">
                                        <canvas id="genderChart"></canvas>
                                        <div className="chart-center-text">
                                            <span className="center-value">
                                                {collegeData.student_history?.student_gender_ratio?.female_percent || collegeData.student_gender_ratio?.female_percentage || 0}%
                                            </span>
                                            <span className="center-label">Female</span>
                                        </div>
                                    </div>
                                    <div className="chart-legend">
                                        <span className="legend-item">
                                            <span className="dot male"></span> Male ({collegeData.student_history?.student_gender_ratio?.male_percent || collegeData.student_gender_ratio?.male_percentage || 0}%)
                                        </span>
                                        <span className="legend-item">
                                            <span className="dot female"></span> Female ({collegeData.student_history?.student_gender_ratio?.female_percent || collegeData.student_gender_ratio?.female_percentage || 0}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        { /* Rankings Table */ }
                        {collegeData.rankings && (() => {
                            const rk = collegeData.rankings;
                            const isRealRank = (v: any) => v !== null && v !== undefined && v !== '' && v !== 0 && String(v).toLowerCase() !== 'n/a' && String(v).toLowerCase() !== 'not applicable' && String(v).toLowerCase() !== 'null';
                            
                            // Map of internal keys to readable labels
                            const labelMap: Record<string, string> = {
                                nirf_2025: "NIRF 2025",
                                nirf_2024: "NIRF 2024",
                                nirf_rank: "NIRF Rank",
                                qs_world: "QS World",
                                qs_asia: "QS Asia",
                                the_world: "THE World",
                                national_rank: "National Rank",
                                state_rank: "State Rank",
                                category_rank: "Category Rank"
                            };

                            const realRows = Object.entries(rk)
                                .filter(([key, value]) => key !== 'guessed_data' && isRealRank(value))
                                .map(([key, value]) => ({
                                    label: labelMap[key] || key.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
                                    value
                                }));
                            return (
                                <section className="content-section">
                                    <h2 className="section-title">🏆 Rankings</h2>
                                    {realRows.length > 0 ? (
                                        <table className="data-table">
                                            <thead><tr><th>Ranking Body</th><th>Rank</th></tr></thead>
                                            <tbody>
                                                {realRows.map(r => (
                                                    <tr key={r.label}><td>{r.label}</td><td>{formatValue(r.value)}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="no-data">This institution does not appear in major national or global rankings.</p>
                                    )}
                                </section>
                            );
                        })()}

                        { /* Faculty & Staff */ }
                        {collegeData.faculty_staff_detail && (collegeData.faculty_staff_detail.total_faculty > 0 || collegeData.faculty_staff_detail.student_faculty_ratio > 0) && (
                            <section className="content-section">
                                <h2 className="section-title">👨‍🏫 Faculty & Staff</h2>
                                <table className="data-table">
                                    <thead><tr><th>Detail</th><th>Value</th></tr></thead>
                                    <tbody>
                                        {collegeData.faculty_staff_detail.total_faculty ? <tr><td>Total Faculty</td><td>{collegeData.faculty_staff_detail.total_faculty.toLocaleString()}</td></tr> : null}
                                        {collegeData.faculty_staff_detail.student_faculty_ratio ? <tr><td>Student-Faculty Ratio</td><td>{collegeData.faculty_staff_detail.student_faculty_ratio}:1</td></tr> : null}
                                        {collegeData.faculty_staff_detail.phd_faculty_percent ? <tr><td>PhD Faculty %</td><td>{collegeData.faculty_staff_detail.phd_faculty_percent}%</td></tr> : null}
                                    </tbody>
                                </table>
                            </section>
                        )}

                        { /* Infrastructure */ }
                        {collegeData.infrastructure && collegeData.infrastructure.length > 0 && (
                            <section className="content-section">
                                <h2 className="section-title">�️ Infrastructure</h2>
                                <table className="data-table">
                                    <thead><tr><th>Facility</th><th>Details</th></tr></thead>
                                    <tbody>
                                        {collegeData.infrastructure.map((item, idx) => (
                                            <tr key={idx}><td>{item.facility}</td><td>{item.details}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}
                    </div>
                )}

                {activeTab === 'programs' && (
                    <div className="tab-content">
                        <ProgramDistribution
                            ugPrograms={collegeData.ug_programs}
                            pgPrograms={collegeData.pg_programs}
                            phdPrograms={collegeData.phd_programs}
                            selectedStatCategory={selectedStatCategory}
                            setSelectedStatCategory={setSelectedStatCategory}
                            collegeName={collegeData.college_name}
                        />
                    </div>
                )}

                {activeTab === 'departments' && (
                    <div className="tab-content">
                        <section className="content-section">
                            <h2 className="section-title">🏛️ Departments ({collegeData.departments?.length || 0})</h2>
                            {collegeData.departments?.length > 0 ? (
                                <div className="departments-split">
                                    { }
                                    <div className="departments-list">
                                        <div className="list-header">Select Department</div>
                                        <div className="list-items">
                                            {collegeData.departments.map((dept, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`dept-item ${selectedDepartment === dept ? 'active' : ''}`}
                                                    onClick={() => setSelectedDepartment(dept)}
                                                >
                                                    {dept}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    { }
                                    <div className="department-details">
                                        {selectedDepartment ? (
                                            <>
                                                <h3 className="dept-name">{selectedDepartment}</h3>
                                                <p className="dept-description">
                                                    {collegeData.college_name} — {selectedDepartment}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="select-prompt">Select a department to view details</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="no-data">No departments data available</p>
                            )}
                        </section>

                        { }
                        <section className="content-section">
                            <h2 className="section-title">All Departments</h2>
                            <div className="departments-grid">
                                {collegeData.departments?.map((dept, idx) => (
                                    <div className="dept-tag" key={idx}>
                                        {dept}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'placements' && (
                    <div className="tab-content">
                        { /* Placement Overview Cards */ }
                        <section className="content-section">
                            <h2 className="section-title">🎯 Placement Statistics{collegeData.placements?.year ? ` (${collegeData.placements.year})` : ''}</h2>
                            {collegeData.placements && (collegeData.placements.highest_package > 0 || collegeData.placements.total_students_placed > 0) ? (
                                <div className="stat-card-grid">
                                    <div className="placement-card highlight">
                                        <span className="placement-icon">💰</span>
                                        <span className="placement-value">{formatPackage(collegeData.placements.highest_package, collegeData.placements.package_currency)}</span>
                                        <span className="placement-label">Highest Package</span>
                                    </div>
                                    <div className="placement-card">
                                        <span className="placement-icon">📊</span>
                                        <span className="placement-value">{formatPackage(collegeData.placements.average_package, collegeData.placements.package_currency)}</span>
                                        <span className="placement-label">Average Package</span>
                                    </div>
                                    <div className="placement-card">
                                        <span className="placement-icon">📈</span>
                                        <span className="placement-value">{formatPackage(collegeData.placements.median_package, collegeData.placements.package_currency)}</span>
                                        <span className="placement-label">Median Package</span>
                                    </div>
                                    <div className="placement-card highlight">
                                        <span className="placement-icon">🎓</span>
                                        <span className="placement-value">{collegeData.placements.placement_rate_percent ? `${collegeData.placements.placement_rate_percent}%` : '-'}</span>
                                        <span className="placement-label">Placement Rate</span>
                                    </div>
                                    <div className="placement-card">
                                        <span className="placement-icon">👨‍🎓</span>
                                        <span className="placement-value">{collegeData.placements.total_students_placed ? collegeData.placements.total_students_placed.toLocaleString() : '-'}</span>
                                        <span className="placement-label">Students Placed</span>
                                    </div>
                                    <div className="placement-card">
                                        <span className="placement-icon">🏢</span>
                                        <span className="placement-value">{collegeData.placements.total_companies_visited ? collegeData.placements.total_companies_visited.toLocaleString() : '-'}</span>
                                        <span className="placement-label">Companies Visited</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="no-data">No placement statistics available</p>
                            )}
                        </section>

                        { /* Placement Highlights */ }
                        {collegeData.placement_highlights && (
                            <section className="content-section">
                                <div className="info-callout">
                                    <strong>📌 Highlights:</strong> {collegeData.placement_highlights}
                                </div>
                            </section>
                        )}

                        { /* Graduate Outcomes Note */ }
                        {collegeData.placements?.graduate_outcomes_note && (
                            <section className="content-section">
                                <div className="info-callout">
                                    <strong>🎓 Graduate Outcomes:</strong> {collegeData.placements.graduate_outcomes_note}
                                </div>
                            </section>
                        )}

                        { /* Placement Comparison Chart + Table */ }
                        {collegeData.placement_comparison_last_3_years && collegeData.placement_comparison_last_3_years.length > 0 && (
                            <section className="content-section">
                                <h2 className="section-title">📊 Placement Comparison (Last 3 Years)</h2>
                                
                                {/* Year Filter Buttons */}
                                <div className="filter-buttons">
                                    <button
                                        className={`filter-btn ${selectedPlacementYear === 'all' ? 'active' : ''}`}
                                        onClick={() => setSelectedPlacementYear('all')}
                                    >
                                        All Years
                                    </button>
                                    {collegeData.placement_comparison_last_3_years.map((comp) => (
                                        <button
                                            key={comp.year}
                                            className={`filter-btn ${selectedPlacementYear === String(comp.year) ? 'active' : ''}`}
                                            onClick={() => setSelectedPlacementYear(String(comp.year))}
                                        >
                                            {comp.year}
                                        </button>
                                    ))}
                                </div>

                                {/* Gender Filter Buttons - Only show if gender data exists */}
                                {collegeData.gender_based_placement_last_3_years && collegeData.gender_based_placement_last_3_years.length > 0 && (
                                    <div className="filter-buttons">
                                        <button
                                            className={`filter-btn ${selectedPlacementGender === 'all' ? 'active' : ''}`}
                                            onClick={() => setSelectedPlacementGender('all')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`filter-btn ${selectedPlacementGender === 'male' ? 'active' : ''}`}
                                            onClick={() => setSelectedPlacementGender('male')}
                                        >
                                            Male
                                        </button>
                                        <button
                                            className={`filter-btn ${selectedPlacementGender === 'female' ? 'active' : ''}`}
                                            onClick={() => setSelectedPlacementGender('female')}
                                        >
                                            Female
                                        </button>
                                    </div>
                                )}
                                
                                <div className="chart-card-full">
                                    <div className="chart-wrapper-bar-full">
                                        <canvas id="placementChart"></canvas>
                                    </div>
                                </div>
                                <table className="data-table" style={{ marginTop: '20px' }}>
                                    <thead><tr><th>Year</th><th>Average Package</th><th>Employment Rate</th></tr></thead>
                                    <tbody>
                                        {collegeData.placement_comparison_last_3_years
                                            .filter(comp => selectedPlacementYear === 'all' || String(comp.year) === selectedPlacementYear)
                                            .map((comp, idx) => (
                                            <tr key={idx}>
                                                <td>{comp.year}</td>
                                                <td>{formatPackage(comp.average_package, comp.package_currency)}</td>
                                                <td>{comp.employment_rate_percent ? `${comp.employment_rate_percent}%` : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}

                        { /* Top Recruiters */ }
                        {collegeData.top_recruiters && collegeData.top_recruiters.length > 0 && (
                            <section className="content-section">
                                <h2 className="section-title">🏢 Top Recruiters</h2>
                                <div className="recruiter-grid">
                                    {collegeData.top_recruiters.map((recruiter, idx) => (
                                        <span className="recruiter-chip" key={idx}>{recruiter}</span>
                                    ))}
                                </div>
                            </section>
                        )}

                        { /* Sector-wise Placement */ }
                        {collegeData.sector_wise_placement_last_3_years && collegeData.sector_wise_placement_last_3_years.length > 0 && (
                            <section className="content-section">
                                <h2 className="section-title">🏭 Sector-wise Placement</h2>
                                <div className="sector-grid">
                                    {collegeData.sector_wise_placement_last_3_years.map((sector, idx) => (
                                        <div className="sector-card" key={idx}>
                                            <h4>{sector.sector}</h4>
                                            <p className="sector-companies">{sector.companies}</p>
                                            <span className="sector-percent">{sector.percent ? `${sector.percent}%` : '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {activeTab === 'fees' && (
                    <div className="tab-content">
                        <FeeStructure
                            fees={collegeData.fees}
                            website={collegeData.website}
                            fees_by_year={collegeData.fees_by_year}
                        />
                        { /* Scholarships Table (structured) */ }
                        <section className="content-section">
                            <h2 className="section-title">🎓 Scholarships</h2>
                            {collegeData.scholarships && collegeData.scholarships.length > 0 ? (
                                <table className="data-table">
                                    <thead><tr><th>Scholarship Name</th><th>Amount</th><th>Eligibility</th><th>Provider</th></tr></thead>
                                    <tbody>
                                        {collegeData.scholarships_detail?.map((s: any, idx: number) => (
                                            <tr key={idx}>
                                                <td><strong>{s.name}</strong></td>
                                                <td>{s.amount ? formatValue(s.amount) + (s.currency_type ? ` ${s.currency_type}` : '') : '-'}</td>
                                                <td>{s.eligibility || '-'}</td>
                                                <td>{s.provider || '-'}</td>
                                            </tr>
                                        )) || <tr><td colSpan={4}>No scholarship data available</td></tr>}
                                    </tbody>
                                </table>
                            ) : collegeData.scholarships_detail && collegeData.scholarships_detail.length > 0 ? (
                                /* Legacy fallback */
                                <table className="data-table">
                                    <thead><tr><th>Scholarship Name</th><th>Amount</th><th>Eligibility</th><th>Provider</th></tr></thead>
                                    <tbody>
                                        {collegeData.scholarships_detail?.map((s: any, idx: number) => (
                                            <tr key={idx}>
                                                <td><strong>{s.name}</strong></td>
                                                <td>{s.amount ? formatValue(s.amount) + (s.currency_type ? ` ${s.currency_type}` : '') : '-'}</td>
                                                <td>{s.eligibility || '-'}</td>
                                                <td>{s.provider || '-'}</td>
                                            </tr>
                                        )) || <tr><td colSpan={4}>No scholarship data available</td></tr>}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-data">No scholarships data available</p>
                            )}
                        </section>
                    </div>
                )}
            </main>

            { /* Footer */ }
            <footer className="page-footer">
                <div className="footer-content">
                    <p>Data Sources: {collegeData.sources?.join(', ') || 'University Website'}</p>
                    {collegeData.contact_info && (
                        <p className="contact-info">
                            📞 {collegeData.contact_info.phone} | ✉️ {collegeData.contact_info.email} | 📍 {collegeData.contact_info.address}
                        </p>
                    )}
                </div>
            </footer>
        </div>
    );
}
