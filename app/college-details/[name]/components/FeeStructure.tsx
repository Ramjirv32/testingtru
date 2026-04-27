'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    PointElement,
} from 'chart.js';

Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    PointElement
);

interface FeeGroup {
    per_year: string | number;
    total_course: string | number;
    currency: string;
}

interface FeeByYear {
    year: number;
    UG?: FeeGroup;
    PG?: FeeGroup;
    PhD?: FeeGroup;
    hostel_per_year?: string | number;
}

interface FeeData {
    UG?: FeeGroup;
    PG?: FeeGroup;
    PhD?: FeeGroup;
    hostel_per_year?: string | number;
    fees_by_year?: FeeByYear[];
    fees_note?: string;
    ug_yearly_min?: number;
    ug_yearly_max?: number;
    pg_yearly_min?: number;
    pg_yearly_max?: number;
}

interface FeeStructureProps {
    fees: FeeData;
    website?: string;
    fees_by_year?: FeeByYear[];
}

export default function FeeStructure({ fees, website, fees_by_year: feesByYearProp }: FeeStructureProps) {
    const columnChartRef = useRef<Chart | null>(null);
    const lineChartRef = useRef<Chart | null>(null);
    const [columnChartAnimated, setColumnChartAnimated] = useState(false);
    const [lineChartAnimated, setLineChartAnimated] = useState(false);
    const [selectedFeeCategory, setSelectedFeeCategory] = useState<string>('all');

    // Merge fees_by_year from prop or fees object
    const finalFees = {
        ...fees,
        fees_by_year: feesByYearProp || fees.fees_by_year,
    };

    // Intersection Observer for scroll detection
    useEffect(() => {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px'
        };

        const columnObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !columnChartAnimated) {
                    setColumnChartAnimated(true);
                }
            });
        }, observerOptions);

        const lineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !lineChartAnimated) {
                    setLineChartAnimated(true);
                }
            });
        }, observerOptions);

        const columnCanvas = document.getElementById('feeColumnChart');
        const lineCanvas = document.getElementById('feeLineChart');

        if (columnCanvas) columnObserver.observe(columnCanvas);
        if (lineCanvas) lineObserver.observe(lineCanvas);

        return () => {
            if (columnCanvas) columnObserver.unobserve(columnCanvas);
            if (lineCanvas) lineObserver.unobserve(lineCanvas);
        };
    }, []);

    // Create Column Chart
    useEffect(() => {
        if (!columnChartAnimated) return;

        const canvas = document.getElementById('feeColumnChart') as HTMLCanvasElement;
        if (!canvas) return;
        if (columnChartRef.current) columnChartRef.current.destroy();

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const feesByYear = finalFees.fees_by_year || [];
        if (feesByYear.length === 0) return;

        const years = feesByYear.map(f => f.year.toString());
        const ugFees = feesByYear.map(f => {
            const val = f.UG?.per_year;
            if (!val || val === 'N/A') return 0;
            const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
            return isNaN(num) ? 0 : num;
        });
        const pgFees = feesByYear.map(f => {
            const val = f.PG?.per_year;
            if (!val || val === 'N/A') return 0;
            const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
            return isNaN(num) ? 0 : num;
        });
        const phdFees = feesByYear.map(f => {
            const val = f.PhD?.per_year;
            if (!val || val === 'N/A') return 0;
            const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
            return isNaN(num) ? 0 : num;
        });

        let datasets: any[] = [];

        if (selectedFeeCategory === 'all') {
            datasets = [
                {
                    label: 'UG Fees',
                    data: ugFees.map(() => 0),
                    backgroundColor: '#070642',
                    borderRadius: 8,
                },
                {
                    label: 'PG Fees',
                    data: pgFees.map(() => 0),
                    backgroundColor: '#9a3197',
                    borderRadius: 8,
                },
                {
                    label: 'PhD Fees',
                    data: phdFees.map(() => 0),
                    backgroundColor: '#e084cd',
                    borderRadius: 8,
                },
            ];
        } else if (selectedFeeCategory === 'ug') {
            datasets = [
                {
                    label: 'UG Fees',
                    data: ugFees.map(() => 0),
                    backgroundColor: '#070642',
                    borderRadius: 8,
                },
            ];
        } else if (selectedFeeCategory === 'pg') {
            datasets = [
                {
                    label: 'PG Fees',
                    data: pgFees.map(() => 0),
                    backgroundColor: '#9a3197',
                    borderRadius: 8,
                },
            ];
        } else if (selectedFeeCategory === 'phd') {
            datasets = [
                {
                    label: 'PhD Fees',
                    data: phdFees.map(() => 0),
                    backgroundColor: '#e084cd',
                    borderRadius: 8,
                },
            ];
        }

        columnChartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                        backgroundColor: 'rgba(7, 6, 66, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const currency = feesByYear[0]?.UG?.currency || feesByYear[0]?.PG?.currency || feesByYear[0]?.PhD?.currency || 'INR';
                                const symbol = currency === 'USD' ? '$' : '₹';
                                return `${context.dataset.label}: ${symbol}${context.raw.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } },
                },
                animation: {
                    duration: 2500,
                    easing: 'easeInOutQuart',
                },
            },
        });

        // Update to actual values after creation to animate from 0
        setTimeout(() => {
            if (columnChartRef.current) {
                if (selectedFeeCategory === 'all') {
                    columnChartRef.current.data.datasets[0].data = ugFees;
                    columnChartRef.current.data.datasets[1].data = pgFees;
                    columnChartRef.current.data.datasets[2].data = phdFees;
                } else if (selectedFeeCategory === 'ug') {
                    columnChartRef.current.data.datasets[0].data = ugFees;
                } else if (selectedFeeCategory === 'pg') {
                    columnChartRef.current.data.datasets[0].data = pgFees;
                } else if (selectedFeeCategory === 'phd') {
                    columnChartRef.current.data.datasets[0].data = phdFees;
                }
                columnChartRef.current.update();
            }
        }, 100);

        return () => {
            if (columnChartRef.current) columnChartRef.current.destroy();
        };
    }, [fees, columnChartAnimated, selectedFeeCategory]);

    // Create Line Chart
    useEffect(() => {
        if (!lineChartAnimated) return;

        const canvas = document.getElementById('feeLineChart') as HTMLCanvasElement;
        if (!canvas) return;
        if (lineChartRef.current) lineChartRef.current.destroy();

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const feesByYear = finalFees.fees_by_year || [];
        if (feesByYear.length === 0) return;

        const years = feesByYear.map(f => f.year.toString());
        const ugFees = feesByYear.map(f => {
            const val = f.UG?.per_year;
            if (!val || val === 'N/A') return 0;
            const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
            return isNaN(num) ? 0 : num;
        });
        const pgFees = feesByYear.map(f => {
            const val = f.PG?.per_year;
            if (!val || val === 'N/A') return 0;
            const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
            return isNaN(num) ? 0 : num;
        });
        const phdFees = feesByYear.map(f => {
            const val = f.PhD?.per_year;
            if (!val || val === 'N/A') return 0;
            const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
            return isNaN(num) ? 0 : num;
        });

        let datasets: any[] = [];

        if (selectedFeeCategory === 'all') {
            datasets = [
                {
                    label: 'UG Fees',
                    data: ugFees.map(() => 0),
                    borderColor: '#070642',
                    backgroundColor: 'rgba(7, 6, 66, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                },
                {
                    label: 'PG Fees',
                    data: pgFees.map(() => 0),
                    borderColor: '#9a3197',
                    backgroundColor: 'rgba(154, 49, 151, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                },
                {
                    label: 'PhD Fees',
                    data: phdFees.map(() => 0),
                    borderColor: '#e084cd',
                    backgroundColor: 'rgba(224, 132, 205, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                },
            ];
        } else if (selectedFeeCategory === 'ug') {
            datasets = [
                {
                    label: 'UG Fees',
                    data: ugFees.map(() => 0),
                    borderColor: '#070642',
                    backgroundColor: 'rgba(7, 6, 66, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                },
            ];
        } else if (selectedFeeCategory === 'pg') {
            datasets = [
                {
                    label: 'PG Fees',
                    data: pgFees.map(() => 0),
                    borderColor: '#9a3197',
                    backgroundColor: 'rgba(154, 49, 151, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                },
            ];
        } else if (selectedFeeCategory === 'phd') {
            datasets = [
                {
                    label: 'PhD Fees',
                    data: phdFees.map(() => 0),
                    borderColor: '#e084cd',
                    backgroundColor: 'rgba(224, 132, 205, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                },
            ];
        }

        lineChartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                        backgroundColor: 'rgba(154, 49, 151, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const currency = feesByYear[0]?.UG?.currency || feesByYear[0]?.PG?.currency || feesByYear[0]?.PhD?.currency || 'INR';
                                const symbol = currency === 'USD' ? '$' : '₹';
                                return `${context.dataset.label}: ${symbol}${context.raw.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } },
                },
                animation: {
                    duration: 2500,
                    easing: 'easeInOutQuart',
                },
            },
        });

        // Update to actual values after creation to animate from 0
        setTimeout(() => {
            if (lineChartRef.current) {
                if (selectedFeeCategory === 'all') {
                    lineChartRef.current.data.datasets[0].data = ugFees;
                    lineChartRef.current.data.datasets[1].data = pgFees;
                    lineChartRef.current.data.datasets[2].data = phdFees;
                } else if (selectedFeeCategory === 'ug') {
                    lineChartRef.current.data.datasets[0].data = ugFees;
                } else if (selectedFeeCategory === 'pg') {
                    lineChartRef.current.data.datasets[0].data = pgFees;
                } else if (selectedFeeCategory === 'phd') {
                    lineChartRef.current.data.datasets[0].data = phdFees;
                }
                lineChartRef.current.update();
            }
        }, 100);

        return () => {
            if (lineChartRef.current) lineChartRef.current.destroy();
        };
    }, [fees, lineChartAnimated, selectedFeeCategory]);

    const formatValue = (val: any, currency?: string): string => {
        if (val === null || val === undefined) return '-';
        if (val === '' || val === 'N/A') return '-';
        if (typeof val === 'number') {
            const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
            return `${symbol}${val.toLocaleString()}`;
        }
        if (typeof val === 'string') {
            const num = parseFloat(val.replace(/[^0-9.-]+/g, ''));
            if (!isNaN(num)) {
                const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
                return `${symbol}${num.toLocaleString()}`;
            }
            return val;
        }
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
    };

    return (
        <>
            {/* Fee Structure Table */}
            <section className="content-section">
                <h2 className="section-title">💰 Fee Structure</h2>

                {/* Filter Buttons */}
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${selectedFeeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedFeeCategory('all')}
                    >
                        All Categories
                    </button>
                    <button
                        className={`filter-btn ${selectedFeeCategory === 'ug' ? 'active' : ''}`}
                        onClick={() => setSelectedFeeCategory('ug')}
                    >
                        UG
                    </button>
                    <button
                        className={`filter-btn ${selectedFeeCategory === 'pg' ? 'active' : ''}`}
                        onClick={() => setSelectedFeeCategory('pg')}
                    >
                        PG
                    </button>
                    <button
                        className={`filter-btn ${selectedFeeCategory === 'phd' ? 'active' : ''}`}
                        onClick={() => setSelectedFeeCategory('phd')}
                    >
                        PhD
                    </button>
                </div>

                {(fees?.UG?.per_year || fees?.PG?.per_year || fees?.PhD?.per_year || fees?.hostel_per_year) ? (
                    <table className="data-table">
                        <thead><tr><th>Category</th><th>Per Year</th><th>Total Course</th><th>Currency</th></tr></thead>
                        <tbody>
                            {(selectedFeeCategory === 'all' || selectedFeeCategory === 'ug') && fees?.UG && (
                                <tr>
                                    <td><strong>🎓 Undergraduate (UG)</strong></td>
                                    <td>
                                        {fees.UG.per_year === 'N/A' || fees.UG.per_year === null || fees.UG.per_year === undefined ? (
                                            website ? (
                                                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="website-link">
                                                    📍 Visit website to see details
                                                </a>
                                            ) : (
                                                <span className="na-placeholder">Information not available</span>
                                            )
                                        ) : (
                                            formatValue(fees.UG.per_year, fees.UG.currency)
                                        )}
                                    </td>
                                    <td>
                                        {fees.UG.total_course === 'N/A' || fees.UG.total_course === null || fees.UG.total_course === undefined ?
                                            (website ? '📍 Check website' : '-')
                                            : formatValue(fees.UG.total_course, fees.UG.currency)}
                                    </td>
                                    <td>{fees.UG.currency || 'INR'}</td>
                                </tr>
                            )}
                            {(selectedFeeCategory === 'all' || selectedFeeCategory === 'pg') && fees?.PG && (
                                <tr>
                                    <td><strong>📚 Postgraduate (PG)</strong></td>
                                    <td>
                                        {fees.PG.per_year === 'N/A' || fees.PG.per_year === null || fees.PG.per_year === undefined ? (
                                            website ? (
                                                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="website-link">
                                                    📍 Visit website to see details
                                                </a>
                                            ) : (
                                                <span className="na-placeholder">Information not available</span>
                                            )
                                        ) : (
                                            formatValue(fees.PG.per_year, fees.PG.currency)
                                        )}
                                    </td>
                                    <td>
                                        {fees.PG.total_course === 'N/A' || fees.PG.total_course === null || fees.PG.total_course === undefined ?
                                            (website ? '📍 Check website' : '-')
                                            : formatValue(fees.PG.total_course, fees.PG.currency)}
                                    </td>
                                    <td>{fees.PG.currency || 'INR'}</td>
                                </tr>
                            )}
                            {(selectedFeeCategory === 'all' || selectedFeeCategory === 'phd') && fees?.PhD && (
                                <tr>
                                    <td><strong>🎓 Doctoral (PhD)</strong></td>
                                    <td>
                                        {fees.PhD.per_year === 'N/A' || fees.PhD.per_year === null || fees.PhD.per_year === undefined ? (
                                            website ? (
                                                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="website-link">
                                                    📍 Visit website to see details
                                                </a>
                                            ) : (
                                                <span className="na-placeholder">Information not available</span>
                                            )
                                        ) : (
                                            formatValue(fees.PhD.per_year, fees.PhD.currency)
                                        )}
                                    </td>
                                    <td>
                                        {fees.PhD.total_course === 'N/A' || fees.PhD.total_course === null || fees.PhD.total_course === undefined ?
                                            (website ? '📍 Check website' : '-')
                                            : formatValue(fees.PhD.total_course, fees.PhD.currency)}
                                    </td>
                                    <td>{fees.PhD.currency || 'INR'}</td>
                                </tr>
                            )}
                            {fees?.hostel_per_year && (
                                <tr>
                                    <td><strong>🏨 Hostel</strong></td>
                                    <td>
                                        {fees.hostel_per_year === 'N/A' || fees.hostel_per_year === null || fees.hostel_per_year === undefined ? (
                                            website ? (
                                                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="website-link">
                                                    📍 Visit website to see details
                                                </a>
                                            ) : (
                                                <span className="na-placeholder">Information not available</span>
                                            )
                                        ) : (
                                            formatValue(fees.hostel_per_year, 'INR')
                                        )}
                                    </td>
                                    <td>-</td>
                                    <td>INR</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-data-with-link">
                        <p>No fee structure data available</p>
                        {website && (
                            <p style={{ marginTop: '1rem' }}>
                                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="website-link-primary">
                                    🔗 Visit the official website to get complete fee details
                                </a>
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* Fee Charts */}
            {finalFees.fees_by_year && finalFees.fees_by_year.length > 0 && (
                <>
                    <section className="content-section">
                        <h2 className="section-title">📊 Fee Comparison (Column Chart)</h2>
                        <div className="categorywise-layout" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            {/* Chart - Size depends on category selection */}
                            <div style={{ flex: selectedFeeCategory === 'all' ? '0 0 55%' : '0 0 40%' }}>
                                <div className="chart-card-full" style={{ height: '400px' }}>
                                    <div className="chart-wrapper-bar-full">
                                        <canvas id="feeColumnChart"></canvas>
                                    </div>
                                </div>
                            </div>

                            {/* Data Table - Right Side */}
                            <div style={{ flex: '1' }}>
                                <h3>Detailed Fee Statistics - {selectedFeeCategory === 'all' ? 'All Categories' : selectedFeeCategory.toUpperCase()}</h3>
                                {selectedFeeCategory === 'all' ? (
                                    // Show all categories table when "All Categories" is selected
                                    <table className="interactive-stats-table">
                                        <thead>
                                            <tr>
                                                <th>Year</th>
                                                <th>UG</th>
                                                <th>PG</th>
                                                <th>PhD</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...finalFees.fees_by_year].sort((a: any, b: any) => a.year - b.year).map((fy: any) => (
                                                <tr key={fy.year}>
                                                    <td>{fy.year}</td>
                                                    <td>{fy.UG?.per_year ? formatValue(fy.UG.per_year, fy.UG.currency) : '-'}</td>
                                                    <td>{fy.PG?.per_year ? formatValue(fy.PG.per_year, fy.PG.currency) : '-'}</td>
                                                    <td>{fy.PhD?.per_year ? formatValue(fy.PhD.per_year, fy.PhD.currency) : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    // Show year-wise table for selected category only
                                    <table className="interactive-stats-table">
                                        <thead>
                                            <tr>
                                                <th>Year</th>
                                                <th>{selectedFeeCategory.toUpperCase()} Fees (Per Year)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...finalFees.fees_by_year].sort((a: any, b: any) => a.year - b.year).map((fy: any) => (
                                                <tr key={fy.year}>
                                                    <td>{fy.year}</td>
                                                    <td>{selectedFeeCategory === 'ug' ? (fy.UG?.per_year ? formatValue(fy.UG.per_year, fy.UG.currency) : '-') : selectedFeeCategory === 'pg' ? (fy.PG?.per_year ? formatValue(fy.PG.per_year, fy.PG.currency) : '-') : (fy.PhD?.per_year ? formatValue(fy.PhD.per_year, fy.PhD.currency) : '-')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="content-section">
                        <h2 className="section-title">📈 Fee Trends (Line Chart)</h2>
                        <div className="categorywise-layout" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            {/* Chart - Size depends on category selection */}
                            <div style={{ flex: selectedFeeCategory === 'all' ? '0 0 55%' : '0 0 40%' }}>
                                <div className="chart-card-full" style={{ height: '400px' }}>
                                    <div className="chart-wrapper-bar-full">
                                        <canvas id="feeLineChart"></canvas>
                                    </div>
                                </div>
                            </div>

                            {/* Data Table - Right Side */}
                            <div style={{ flex: '1' }}>
                                <h3>Detailed Fee Statistics - {selectedFeeCategory === 'all' ? 'All Categories' : selectedFeeCategory.toUpperCase()}</h3>
                                {selectedFeeCategory === 'all' ? (
                                    // Show all categories table when "All Categories" is selected
                                    <table className="interactive-stats-table">
                                        <thead>
                                            <tr>
                                                <th>Year</th>
                                                <th>UG</th>
                                                <th>PG</th>
                                                <th>PhD</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...finalFees.fees_by_year].sort((a: any, b: any) => a.year - b.year).map((fy: any) => (
                                                <tr key={fy.year}>
                                                    <td>{fy.year}</td>
                                                    <td>{fy.UG?.total_course ? formatValue(fy.UG.total_course, fy.UG.currency) : '-'}</td>
                                                    <td>{fy.PG?.total_course ? formatValue(fy.PG.total_course, fy.PG.currency) : '-'}</td>
                                                    <td>{fy.PhD?.total_course ? formatValue(fy.PhD.total_course, fy.PhD.currency) : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    // Show year-wise table for selected category only
                                    <table className="interactive-stats-table">
                                        <thead>
                                            <tr>
                                                <th>Year</th>
                                                <th>{selectedFeeCategory.toUpperCase()} Fees (Total Course)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...finalFees.fees_by_year].sort((a: any, b: any) => a.year - b.year).map((fy: any) => (
                                                <tr key={fy.year}>
                                                    <td>{fy.year}</td>
                                                    <td>{selectedFeeCategory === 'ug' ? (fy.UG?.total_course ? formatValue(fy.UG.total_course, fy.UG.currency) : '-') : selectedFeeCategory === 'pg' ? (fy.PG?.total_course ? formatValue(fy.PG.total_course, fy.PG.currency) : '-') : (fy.PhD?.total_course ? formatValue(fy.PhD.total_course, fy.PhD.currency) : '-')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Fees by Year Table */}
                    <section className="content-section">
                        <h2 className="section-title">📅 Fees by Year</h2>
                        <table className="data-table">
                            <thead><tr><th>Year</th><th>Program</th><th>Per Year</th><th>Total Course</th><th>Hostel/Year</th><th>Currency</th></tr></thead>
                            <tbody>
                                {finalFees.fees_by_year.map((fy, idx) => (
                                    <React.Fragment key={idx}>
                                        {(selectedFeeCategory === 'all' || selectedFeeCategory === 'ug') && (
                                            <tr>
                                                <td rowSpan={selectedFeeCategory === 'all' ? 3 : 1}>{fy.year}</td>
                                                <td>UG</td>
                                                <td>{fy.UG?.per_year ? formatValue(fy.UG.per_year, fy.UG.currency) : '-'}</td>
                                                <td>{fy.UG?.total_course ? formatValue(fy.UG.total_course, fy.UG.currency) : '-'}</td>
                                                <td rowSpan={selectedFeeCategory === 'all' ? 3 : 1}>{fy.hostel_per_year ? formatValue(fy.hostel_per_year, fy.UG?.currency || 'INR') : '-'}</td>
                                                <td rowSpan={selectedFeeCategory === 'all' ? 3 : 1}>{fy.UG?.currency || fy.PG?.currency || fy.PhD?.currency || 'RWF'}</td>
                                            </tr>
                                        )}
                                        {(selectedFeeCategory === 'all' || selectedFeeCategory === 'pg') && (
                                            <tr>
                                                {selectedFeeCategory === 'pg' && <td rowSpan={1}>{fy.year}</td>}
                                                <td>PG</td>
                                                <td>{fy.PG?.per_year ? formatValue(fy.PG.per_year, fy.PG.currency) : '-'}</td>
                                                <td>{fy.PG?.total_course ? formatValue(fy.PG.total_course, fy.PG.currency) : '-'}</td>
                                                {selectedFeeCategory === 'pg' && <td rowSpan={1}>{fy.hostel_per_year ? formatValue(fy.hostel_per_year, fy.PG?.currency || 'INR') : '-'}</td>}
                                                {selectedFeeCategory === 'pg' && <td rowSpan={1}>{fy.PG?.currency || 'RWF'}</td>}
                                            </tr>
                                        )}
                                        {(selectedFeeCategory === 'all' || selectedFeeCategory === 'phd') && (
                                            <tr>
                                                {selectedFeeCategory === 'phd' && <td rowSpan={1}>{fy.year}</td>}
                                                <td>PhD</td>
                                                <td>{fy.PhD?.per_year ? formatValue(fy.PhD.per_year, fy.PhD.currency) : '-'}</td>
                                                <td>{fy.PhD?.total_course ? formatValue(fy.PhD.total_course, fy.PhD.currency) : '-'}</td>
                                                {selectedFeeCategory === 'phd' && <td rowSpan={1}>{fy.hostel_per_year ? formatValue(fy.hostel_per_year, fy.PhD?.currency || 'INR') : '-'}</td>}
                                                {selectedFeeCategory === 'phd' && <td rowSpan={1}>{fy.PhD?.currency || 'RWF'}</td>}
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </>
            )}

            {/* Fees Note */}
            {finalFees.fees_note && (
                <section className="content-section">
                    <div className="info-callout">
                        <strong>📝 Note:</strong> {finalFees.fees_note}
                    </div>
                </section>
            )}
        </>
    );
}
