import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../constants/studentProfile';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

export default function CompleteProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [studentIndexNumber, setStudentIndexNumber] = useState('');
  const [academicYear, setAcademicYear] = useState('1');
  const [semester, setSemester] = useState('1');
  const [department, setDepartment] = useState('IT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'USER') {
    return <Navigate to="/" replace />;
  }
  if (user?.studentIndexNumber) {
    return <Navigate to="/" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await updateProfile({
        studentIndexNumber: studentIndexNumber.trim(),
        academicYear: Number(academicYear),
        semester: Number(semester),
        department,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader
        title="Complete student profile"
        description="Add your campus details to unlock all hub features, including resource bookings and ticketing."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Student profile' }]}
      />

      <Card glass className="mx-auto max-w-xl animate-slide-up">
        <CardContent className="p-8 md:p-10">
          <form onSubmit={submit} className="space-y-6">
            <Input
              label="Index number"
              value={studentIndexNumber}
              onChange={(e) => setStudentIndexNumber(e.target.value)}
              placeholder="e.g. IT2024001"
              required
              minLength={3}
              maxLength={64}
              hint="Your official campus registration number."
            />
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Year of study</label>
                <select
                  className="w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  required
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Semester</label>
                <select
                  className="w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Department</label>
              <select
                className="w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-rose-100 bg-rose-50 text-rose-800 text-xs font-bold animate-fade-in">
                {error}
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[140px]">
                {loading ? 'Saving...' : 'Finish Setup'}
              </Button>
              <Link to="/" className="text-sm font-bold text-slate-400 hover:text-uni-blue transition-colors">
                Skip for now
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
