import GoogleSheetsImporter from '@/components/GoogleSheetsImporter';
import RawDataTable from '@/components/RawDataTable';

export default function RawDataPage() {
  return (
    <div className="text-black w-full max-w-none p-4">
      <GoogleSheetsImporter />
      <RawDataTable />
    </div>
  );
}


