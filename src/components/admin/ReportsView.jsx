import React, { useState } from 'react';
import { toast } from 'react-toastify';

// ReportsView component handles displaying and managing user/content reports in the admin panel
const ReportsView = ({
    reports,
    onResolve,
    onIgnore,
    onViewUser,
    onBanUser,
    onBlockUser
}) => {

    // State for filtering reports (pending, resolved, ignored, all)
    const [filter, setFilter] = useState('pending');

    // State for currently selected report (for detail view)
    const [selectedReport, setSelectedReport] = useState(null);

    // Filter reports based on selected filter
    const filteredReports = Array.isArray(reports) ? reports.filter(report => {
        if (filter === 'all') return true;
        return report.status === filter;
    }) : [];

    // Handles actions taken to resolve a report (ban, block, warning, no_action)
    const handleResolveAction = (reportId, action) => {
        let reason;

        // Prompt for reason/message if required by action type
        if (action === 'ban' || action === 'block') {
            reason = prompt(`Enter reason for ${action === 'ban' ? 'banning' : 'blocking'} this user:`);
            if (!reason) {

                // Show error if no reason provided
                console.error(`Action canceled: A reason is required`);
                toast.error(`Action canceled: A reason is required`);
                return;
            }
        } else if (action === 'warning') {
            reason = prompt('Enter warning message to send to user:');
            if (!reason) {

                // Show error if no warning message provided
                console.error(`Action canceled: A warning message is required`);
                toast.error(`Action canceled: A warning message is required`);
                return;
            }
        } else {

            // No reason needed for 'no_action'
            reason = 'No action needed';
        }

        // Call parent handler to resolve the report
        onResolve(reportId, action, reason);

        // Find the report and perform additional user actions if needed
        const report = reports.find(r => r.id === reportId);
        if (report && report.user) {
            if (action === 'ban') {
                onBanUser(report.user._id, reason);
            } else if (action === 'block') {
                onBlockUser(report.user._id, 'block', reason);
            } else if (action === 'warning') {

                // Simulate sending warning
                console.log(`Warning sent to ${report.user.name}: ${reason}`);
                toast.success(`Warning sent to ${report.user.name}`);
            }
        }

        // Deselect report after action
        setSelectedReport(null);
    };

    return (
        <div className="flex-1 p-6 bg-gray-50 overflow-auto">

            {/* Header and filter buttons */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Reports Management</h2>
                    <p className="text-gray-600">Handle user reports and content violations</p>
                </div>

                {/* Filter buttons for report status */}
                <div className="flex rounded-md shadow-sm">
                    <button
                        className={`px-4 py-2 text-sm ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border border-gray-300`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending

                        {/* Show count of pending reports */}
                        {Array.isArray(reports) && reports.filter(r => r.status === 'pending').length > 0 && (
                            <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5">
                                {reports.filter(r => r.status === 'pending').length}
                            </span>
                        )}
                    </button>
                    <button
                        className={`px-4 py-2 text-sm ${filter === 'resolved' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border-t border-b border-gray-300`}
                        onClick={() => setFilter('resolved')}
                    >
                        Resolved
                    </button>
                    <button
                        className={`px-4 py-2 text-sm ${filter === 'ignored' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border-t border-b border-gray-300`}
                        onClick={() => setFilter('ignored')}
                    >
                        Ignored
                    </button>
                    <button
                        className={`px-4 py-2 text-sm ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 rounded-r-md`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                </div>
            </div>

            {/* Show message if no reports found for current filter */}
            {filteredReports.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-10 text-center">
                    <div className="text-5xl text-gray-300 mb-4">
                        <i className="far fa-flag"></i>
                    </div>
                    <h3 className="text-xl font-medium text-gray-700">No reports found</h3>
                    <p className="text-gray-500 mt-2">
                        {filter === 'pending' ? "There are no pending reports at this time." :
                            filter === 'resolved' ? "No resolved reports found." :
                                filter === 'ignored' ? "No ignored reports found." :
                                    "No reports found in the system."}
                    </p>
                </div>
            ) : (

                // Main grid: left = list of reports, right = details/actions
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* List of filtered reports */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-medium text-gray-700">
                                {filter === 'pending' ? "Pending Reports" :
                                    filter === 'resolved' ? "Resolved Reports" :
                                        filter === 'ignored' ? "Ignored Reports" :
                                            "All Reports"}
                            </h3>
                        </div>
                        <ul className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {Array.isArray(filteredReports) && filteredReports.map(report => (
                                <li
                                    key={report.id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedReport?.id === report.id ? 'bg-blue-50' : ''}`}
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <div className="flex justify-between">

                                        {/* Status badge */}
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {report.status === 'pending' ? 'Pending' :
                                                report.status === 'resolved' ? 'Resolved' :
                                                    'Ignored'}
                                        </span>

                                        {/* Report timestamp */}
                                        <span className="text-xs text-gray-500">
                                            {new Date(report.timestamp).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <div className="flex items-center">

                                            {/* Show type badge */}
                                            {report.type === 'user' && (
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded mr-2">User</span>
                                            )}
                                            {report.type === 'message' && (
                                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded mr-2">Message</span>
                                            )}
                                            <h4 className="font-medium text-gray-900">
                                                {report.type === 'user' ? `Report on ${report.user.name}` : 'Content report'}
                                            </h4>
                                        </div>

                                        {/* Short preview of report content */}
                                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                            {report.content}
                                        </p>

                                        {/* Show resolution if resolved */}
                                        {report.status === 'resolved' && (
                                            <div className="mt-2 text-xs">
                                                <span className="text-gray-500">Resolved with: </span>
                                                <span className={`font-medium ${report.resolution === 'ban' ? 'text-red-600' :
                                                    report.resolution === 'block' ? 'text-orange-600' :
                                                        report.resolution === 'warning' ? 'text-yellow-600' :
                                                            'text-green-600'
                                                    }`}>
                                                    {report.resolution}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Report details and actions */}
                    <div className="bg-white rounded-lg shadow-sm">
                        {selectedReport ? (
                            <div>

                                {/* Header with status */}
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between">
                                    <h3 className="font-medium text-gray-700">Report Details</h3>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${selectedReport.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        selectedReport.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {selectedReport.status === 'pending' ? 'Pending' :
                                            selectedReport.status === 'resolved' ? 'Resolved' :
                                                'Ignored'}
                                    </span>
                                </div>

                                <div className="p-6">

                                    {/* Basic report info */}
                                    <div className="mb-6">
                                        <div className="text-sm">
                                            <span className="text-gray-500">Report Type:</span>{' '}
                                            <span className="font-medium">{selectedReport.type === 'user' ? 'User Report' : 'Content Report'}</span>
                                        </div>
                                        <div className="text-sm mt-1">
                                            <span className="text-gray-500">Submitted:</span>{' '}
                                            <span className="font-medium">{new Date(selectedReport.timestamp).toLocaleString()}</span>
                                        </div>

                                        {/* Show who reported */}
                                        {selectedReport.reportedBy && (
                                            <div className="text-sm mt-1">
                                                <span className="text-gray-500">Reported by:</span>{' '}
                                                <span className="font-medium">{selectedReport.reportedBy}</span>
                                            </div>
                                        )}

                                        {/* Show flagged words if any */}
                                        {selectedReport.flaggedWords && selectedReport.flaggedWords.length > 0 && (
                                            <div className="mt-2">
                                                <span className="text-gray-500 text-sm">Flagged terms:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedReport.flaggedWords.map((word, idx) => (
                                                        <span key={idx} className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                                                            {word}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* User info if report is about a user */}
                                    {selectedReport.user && (
                                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center">
                                                <img
                                                    src={selectedReport.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedReport.user.name)}`}
                                                    alt={selectedReport.user.name}
                                                    className="w-10 h-10 rounded-full mr-3"
                                                />
                                                <div>
                                                    <h4 className="font-medium">{selectedReport.user.name}</h4>
                                                    <div className="text-xs text-gray-500">{selectedReport.user.email}</div>
                                                </div>

                                                {/* Button to view user profile */}
                                                <button
                                                    onClick={() => onViewUser(selectedReport.user)}
                                                    className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Full report content */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Report Details</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.content}</p>
                                        </div>
                                    </div>

                                    {/* Show resolution details if resolved */}
                                    {selectedReport.status === 'resolved' && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Resolution</h4>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <div className="text-sm">
                                                    <span className="text-gray-600">Action taken:</span>{' '}
                                                    <span className="font-medium">{selectedReport.resolution}</span>
                                                </div>
                                                {selectedReport.resolutionReason && (
                                                    <div className="text-sm mt-1">
                                                        <span className="text-gray-600">Reason:</span>{' '}
                                                        <span>{selectedReport.resolutionReason}</span>
                                                    </div>
                                                )}
                                                <div className="text-sm mt-1">
                                                    <span className="text-gray-600">Resolved by:</span>{' '}
                                                    <span>{selectedReport.resolvedBy}</span> on {new Date(selectedReport.resolvedAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Show action buttons if report is pending */}
                                    {selectedReport.status === 'pending' && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex flex-wrap gap-2">

                                                {/* Ban user action */}
                                                <button
                                                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                    onClick={() => handleResolveAction(selectedReport.id, 'ban')}
                                                >
                                                    Ban User
                                                </button>

                                                {/* Block user action */}
                                                <button
                                                    className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                                    onClick={() => handleResolveAction(selectedReport.id, 'block')}
                                                >
                                                    Block User
                                                </button>

                                                {/* Send warning action */}
                                                <button
                                                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                    onClick={() => handleResolveAction(selectedReport.id, 'warning')}
                                                >
                                                    Send Warning
                                                </button>

                                                {/* No action needed */}
                                                <button
                                                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                    onClick={() => handleResolveAction(selectedReport.id, 'no_action')}
                                                >
                                                    No Action Needed
                                                </button>

                                                {/* Ignore report */}
                                                <button
                                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                                    onClick={() => onIgnore(selectedReport.id)}
                                                >
                                                    Ignore Report
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (

                            // Show prompt to select a report if none selected
                            <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                                <div className="text-5xl text-gray-300 mb-4">
                                    <i className="far fa-clipboard"></i>
                                </div>
                                <h3 className="text-xl font-medium text-gray-700">Select a report</h3>
                                <p className="text-gray-500 mt-2">
                                    Choose a report from the list to view details and take action
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsView;
