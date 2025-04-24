import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import('./customApexChart'), { ssr: false });

export default ApexChart;