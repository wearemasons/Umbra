'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { ResearchPaperCard } from '@/components/research-paper-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Mock data for research papers
const mockPapers = [
  {
    id: '1',
    title: 'Advances in Quantum Computing Algorithms',
    authors: ['John Smith', 'Alice Johnson', 'Robert Williams'],
    date: '2023-10-15',
    summary:
      'This paper presents novel algorithms for quantum computing that demonstrate significant improvements in computational efficiency compared to classical approaches.',
    tags: ['Quantum Computing', 'Algorithms', 'Efficiency'],
    isSaved: false,
  },
  {
    id: '2',
    title: 'Machine Learning Applications in Healthcare',
    authors: ['Emily Davis', 'Michael Brown'],
    date: '2024-01-22',
    summary:
      'An in-depth analysis of how machine learning models are revolutionizing diagnostics and treatment planning in modern healthcare systems.',
    tags: ['Machine Learning', 'Healthcare', 'Diagnostics'],
    isSaved: true,
  },
  {
    id: '3',
    title: 'Sustainable Energy Solutions for Urban Areas',
    authors: ['Sarah Wilson', 'David Martinez', 'Jennifer Lee', 'Christopher Taylor'],
    date: '2023-12-05',
    summary:
      'This research explores innovative approaches to implementing sustainable energy systems in densely populated urban environments.',
    tags: ['Sustainability', 'Energy', 'Urban Planning'],
    isSaved: false,
  },
  {
    id: '4',
    title: 'Neural Network Optimization Techniques',
    authors: ['Daniel Anderson', 'Lisa Thomas'],
    date: '2024-02-18',
    summary:
      'A comprehensive study of optimization methods for deep neural networks, including gradient descent variants and regularization techniques.',
    tags: ['Neural Networks', 'Optimization', 'Deep Learning'],
    isSaved: true,
  },
  {
    id: '5',
    title: 'Blockchain Technology in Supply Chain Management',
    authors: ['Kevin Jackson', 'Amanda White', 'Brian Harris'],
    date: '2023-11-30',
    summary:
      'This paper examines the implementation of blockchain technology to enhance transparency and efficiency in global supply chain operations.',
    tags: ['Blockchain', 'Supply Chain', 'Transparency'],
    isSaved: false,
  },
  {
    id: '6',
    title: 'Biotechnology Innovations in Agriculture',
    authors: ['Rachel Clark', 'Steven Lewis', 'Patricia Walker'],
    date: '2024-03-10',
    summary:
      'Review of recent biotechnological advances that have led to improved crop yields and resistance to environmental stressors.',
    tags: ['Biotechnology', 'Agriculture', 'Crop Science'],
    isSaved: false,
  },
  {
    id: '7',
    title: 'Renewable Energy Storage Systems',
    authors: ['Mark Young', 'Nancy Hall'],
    date: '2023-09-25',
    summary:
      'Analysis of various renewable energy storage technologies and their potential for large-scale implementation in power grids.',
    tags: ['Renewable Energy', 'Storage', 'Power Grids'],
    isSaved: true,
  },
  {
    id: '8',
    title: 'Artificial Intelligence in Financial Forecasting',
    authors: ['Andrew King', 'Samantha Wright', 'Thomas Scott'],
    date: '2024-01-15',
    summary:
      'This research evaluates the effectiveness of AI models in predicting financial market trends and their impact on investment strategies.',
    tags: ['AI', 'Finance', 'Forecasting'],
    isSaved: false,
  },
];

export default function ResearchesPage() {
  // const [papers, setPapers] = useState(mockPapers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPapers, setFilteredPapers] = useState(mockPapers);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const papersPerPage = 6;

  // Extract all unique tags for the filter dropdown
  const allTags = Array.from(new Set(mockPapers.flatMap((paper) => paper.tags)));

  // Apply search and filters
  useEffect(() => {
    let result = mockPapers;

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (paper) =>
          paper.title.toLowerCase().includes(term) ||
          paper.authors.some((author) => author.toLowerCase().includes(term)) ||
          paper.summary.toLowerCase().includes(term) ||
          paper.tags.some((tag) => tag.toLowerCase().includes(term)),
      );
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      result = result.filter((paper) => selectedTags.every((tag) => paper.tags.includes(tag)));
    }

    // Apply category filter
    if (filter !== 'all') {
      if (filter === 'saved') {
        result = result.filter((paper) => paper.isSaved);
      }
    }

    setFilteredPapers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filter, selectedTags]);

  // Handle save action
  const handleSave = (id: string) => {
    console.log(id);
    // setPapers(prevPapers =>
    //   prevPapers.map(paper =>
    //     paper.id === id
    //       ? { ...paper, isSaved: !paper.isSaved }
    //       : paper
    //   )
    // );

    // // Update filtered papers as well
    // setFilteredPapers(prevPapers =>
    //   prevPapers.map(paper =>
    //     paper.id === id
    //       ? { ...paper, isSaved: !paper.isSaved }
    //       : paper
    //   )
    // );
  };

  // Pagination calculations
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = filteredPapers.slice(indexOfFirstPaper, indexOfLastPaper);
  const totalPages = Math.ceil(filteredPapers.length / papersPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add a tag to the filter
  const addTagFilter = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Remove a tag from the filter
  const removeTagFilter = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full">
        {/* Search and Filters Section - Fixed at top */}
        <div className="p-6 border-b ">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search papers by title, author, or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Dropdown */}
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Papers</SelectItem>
                  <SelectItem value="saved">Saved Papers</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filters Toggle */}
              <Button
                variant="outline"
                className="sm:hidden flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Desktop Tags Filter */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => addTagFilter(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>

            {/* Mobile Tags Filter - only shown when toggle is clicked */}
            {showFilters && (
              <div className="sm:hidden flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => addTagFilter(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-gray-600 self-center">Active filters:</span>
                {selectedTags.map((tag) => (
                  <div key={tag} className="inline-flex items-center gap-1 bg-secondary rounded-full px-3 py-1 text-sm">
                    <span>{tag}</span>
                    <button onClick={() => removeTagFilter(tag)} className="text-gray-500 hover:text-gray-700">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className="text-xs">
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Papers Grid */}
          {filteredPapers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentPapers.map((paper) => (
                  <ResearchPaperCard key={paper.id} paper={paper} onSave={handleSave} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center pb-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : currentPage)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (totalPages <= 7) {
                          // Show all pages if total is 7 or less
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={page === currentPage}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else {
                          // Show ellipsis logic for larger page counts
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1) ||
                            (currentPage <= 2 && page <= 3) ||
                            (currentPage >= totalPages - 1 && page >= totalPages - 2);

                          if (showPage) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={page === currentPage}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            (currentPage === 3 && page === 2) ||
                            (currentPage === totalPages - 2 && page === totalPages - 1)
                          ) {
                            return <PaginationEllipsis key={`ellipsis-${page}`} />;
                          }
                          return null;
                        }
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : currentPage)}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No research papers found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
