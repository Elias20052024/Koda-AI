import React from 'react';
import { Link } from 'wouter';
import { useListInternships } from '@workspace/api-client-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Briefcase, Calendar, Clock, DollarSign, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function InternshipsPage() {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: internships,
    isLoading,
    isError,
    error,
    refetch,
  } = useListInternships(
    { search: debouncedSearch },
    { query: { queryKey: ['internships', debouncedSearch] } }
  );

  const filteredData = (internships ?? []).filter((internship) => {
    const normalizedSearch = debouncedSearch.trim().toLocaleLowerCase();
    return [
      internship.title,
      internship.companyName ?? '',
      ...(internship.skills ?? []),
    ].some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="bg-muted/20 min-h-[calc(100vh-64px)] pb-20">
      {/* Header Search Section */}
      <div className="bg-foreground text-white py-16 px-4 md:px-8 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-10"></div>
        <div className="container mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Find your next role.</h1>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search by role, company, or skill..." 
                className="h-14 pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-primary focus-visible:border-primary text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative flex-1 md:max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Location (e.g. Remote)" 
                className="h-14 pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-primary focus-visible:border-primary text-base"
              />
            </div>
            <Button className="h-14 px-8 brand-gradient border-0 text-white shadow-lg hover:opacity-90 whitespace-nowrap">
              Search Jobs
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Filters</h3>
            <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">Clear All</Button>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Role Type</h4>
            <div className="space-y-2">
              {['Frontend', 'Backend', 'Full Stack', 'Data Science', 'DevOps'].map(type => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4" />
                  <span className="text-sm text-foreground">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Term</h4>
            <div className="space-y-2">
              {['Summer 2024', 'Fall 2024', 'Winter 2025'].map(term => (
                <label key={term} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4" />
                  <span className="text-sm text-foreground">{term}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">Showing <span className="font-semibold text-foreground">{filteredData.length}</span> internships</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer">
                <option>Most Relevant</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="space-y-4 rounded-xl border border-destructive/30 bg-card py-12 text-center">
              <h3 className="text-lg font-semibold">Could not load internships</h3>
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : "Please try again."}
              </p>
              <Button variant="outline" onClick={() => void refetch()}>Try again</Button>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No internships found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((internship) => (
                <Card key={internship.id} className="hover:border-primary/50 transition-colors shadow-sm hover:shadow-md overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="h-16 w-16 shrink-0 rounded-lg border bg-muted flex items-center justify-center font-bold text-xl text-foreground">
                        {internship.companyName?.substring(0, 2).toUpperCase() || 'CO'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link href={`/internships/${internship.id}`} className="inline-block group-hover:text-primary transition-colors">
                          <h2 className="text-xl font-bold truncate mb-1">{internship.title}</h2>
                        </Link>
                        <p className="text-muted-foreground mb-4">{internship.companyName}</p>
                        
                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mb-4">
                          {internship.location && (
                            <div className="flex items-center"><MapPin className="h-4 w-4 mr-1.5" />{internship.location}</div>
                          )}
                          {internship.type && (
                            <div className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" />{internship.type}</div>
                          )}
                          {internship.duration && (
                            <div className="flex items-center"><Clock className="h-4 w-4 mr-1.5" />{internship.duration}</div>
                          )}
                          {internship.salary && (
                            <div className="flex items-center"><DollarSign className="h-4 w-4 mr-1" />{internship.salary}</div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(internship.skills || []).map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-start sm:items-end shrink-0 pt-2 sm:pt-0">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full mb-4 sm:mb-0">
                          {internship.applicantsCount || 0} applicants
                        </span>
                        <Button asChild>
                          <Link href={`/internships/${internship.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
