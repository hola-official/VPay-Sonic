import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Loader2,
  Clock,
  Wallet,
  BarChart3,
  CheckCircle,
  X,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  Play,
  Pause,
  Settings,
} from "lucide-react";
import { useVestingManager } from "@/hooks/useVestingManager";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { AnimatePresence, motion } from "framer-motion";
import truncateWalletAddress from "@/lib/truncateWalletAddress";

export default function VestingSchedulesPage() {
  const navigate = useNavigate();
  const { address: userAddress } = useAccount();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const vestingManager = useVestingManager();

  // State for schedules data
  const [userSchedules, setUserSchedules] = useState({
    recipientSchedules: [],
    senderSchedules: [],
  });
  const [detailedSchedules, setDetailedSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [stats, setStats] = useState({
    totalSchedules: 0,
    activeSchedules: 0,
    completedSchedules: 0,
    cancelledSchedules: 0,
    totalVestedAmount: 0,
    totalReleasedAmount: 0,
    totalReleasableAmount: 0,
  });

  // Get schedules based on active tab
  const getSchedulesForTab = () => {
    switch (activeTab) {
      case "sent":
        return detailedSchedules.filter((schedule) =>
          userSchedules.senderSchedules.includes(schedule.scheduleId)
        );
      case "received":
        return detailedSchedules.filter((schedule) =>
          userSchedules.recipientSchedules.includes(schedule.scheduleId)
        );
      case "all":
        return detailedSchedules;
      default:
        return detailedSchedules;
    }
  };

  // Filter schedules by status
  const getFilteredSchedules = () => {
    let schedules = getSchedulesForTab();

    if (selectedStatus && selectedStatus !== "all") {
      schedules = schedules.filter((schedule) => {
        const progress = getScheduleProgress(schedule);
        if (selectedStatus === "active") {
          return !schedule.cancelled && progress < 100;
        } else if (selectedStatus === "completed") {
          return !schedule.cancelled && progress >= 100;
        } else if (selectedStatus === "cancelled") {
          return schedule.cancelled;
        } else if (selectedStatus === "pending") {
          return !schedule.cancelled && progress === 0;
        }
        return true;
      });
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      schedules = schedules.filter(
        (schedule) =>
          schedule.contractTitle?.toLowerCase().includes(searchLower) ||
          schedule.recipient?.toLowerCase().includes(searchLower) ||
          schedule.sender?.toLowerCase().includes(searchLower) ||
          schedule.recipientEmail?.toLowerCase().includes(searchLower)
      );
    }

    return schedules;
  };

  const schedules = getFilteredSchedules();

  const getStatusColor = (schedule) => {
    if (schedule.cancelled) {
      return "bg-red-500/20 text-red-400 border-red-500/30";
    }

    const progress = getScheduleProgress(schedule);
    if (progress >= 100) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    } else if (progress > 0) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    } else {
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getStatusText = (schedule) => {
    if (schedule.cancelled) return "Cancelled";

    const progress = getScheduleProgress(schedule);
    if (progress >= 100) return "Completed";
    if (progress > 0) return "Active";
    return "Pending";
  };

  const getScheduleProgress = (schedule) => {
    const now = Date.now() / 1000;
    const start = Number(schedule.startTime);
    const end = Number(schedule.endTime);

    if (now < start) return 0;
    if (now >= end) return 100;

    return ((now - start) / (end - start)) * 100;
  };

const formatAmount = (amount, decimals = 18) => {
  if (!amount || !decimals) return null;
  if (!amount) return 0;
  return Number(amount).toLocaleString();
};

  const formatScheduleTime = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const loadUserSchedules = useCallback(async () => {
    if (!userAddress) return;

    setLoadingSchedules(true);
    try {
      const schedules = await vestingManager.getUserSchedules();
      setUserSchedules(schedules);

      // Get detailed info for all schedules
      const allScheduleIds = [
        ...schedules.recipientSchedules,
        ...schedules.senderSchedules,
      ];

      if (allScheduleIds.length > 0) {
        const detailed =
          await vestingManager.getDetailedScheduleInfo(allScheduleIds);
        setDetailedSchedules(detailed);

        // Calculate stats inline to avoid dependency loop
        const newStats = {
          totalSchedules: detailed.length,
          activeSchedules: 0,
          completedSchedules: 0,
          cancelledSchedules: 0,
          totalVestedAmount: 0,
          totalReleasedAmount: 0,
          totalReleasableAmount: 0,
        };

        detailed.forEach((schedule) => {
          const progress = getScheduleProgress(schedule);

          if (schedule.cancelled) {
            newStats.cancelledSchedules++;
          } else if (progress >= 100) {
            newStats.completedSchedules++;
          } else if (progress > 0) {
            newStats.activeSchedules++;
          }

          newStats.totalVestedAmount += Number(schedule.vestedAmount || 0);
          newStats.totalReleasedAmount += Number(schedule.releasedAmount || 0);
          newStats.totalReleasableAmount += Number(
            schedule.releasableAmount || 0
          );
        });

        setStats(newStats);
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
    } finally {
      setLoadingSchedules(false);
    }
  }, [userAddress, vestingManager]);

  const handleReleaseTokens = async (scheduleId) => {
    try {
      await vestingManager.releaseTokens(scheduleId);
      // Refresh schedules
      await loadUserSchedules();
    } catch (error) {
      console.error("Error releasing tokens:", error);
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    if (
      window.confirm("Are you sure you want to cancel this vesting schedule?")
    ) {
      try {
        await vestingManager.cancelVestingSchedule(scheduleId);
        // Refresh schedules
        await loadUserSchedules();
      } catch (error) {
        console.error("Error cancelling schedule:", error);
      }
    }
  };

  const handleSearch = async () => {
    // For now, just filter locally since we don't have search API
    // In the future, this could call a search API
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  useEffect(() => {
    if (userAddress) {
      loadUserSchedules();
    }
  }, [userAddress, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Vesting Schedules
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your payroll vesting schedules and token releases
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/payroll/create")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Schedule
          </button>
          <button
            onClick={loadUserSchedules}
            disabled={loadingSchedules}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingSchedules ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Wallet Connection Prompt */}
      {!userAddress && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-400">
            Please connect your wallet to view and manage your vesting
            schedules.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      {userAddress && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {loadingSchedules ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    stats.totalSchedules
                  )}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Total Schedules
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {loadingSchedules ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    stats.activeSchedules
                  )}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {loadingSchedules ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    stats.completedSchedules
                  )}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {loadingSchedules ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    stats.cancelledSchedules
                  )}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">Cancelled</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "all"
              ? "bg-white/10 text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          All Schedules
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "sent"
              ? "bg-white/10 text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Created by Me
        </button>
        <button
          onClick={() => setActiveTab("received")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "received"
              ? "bg-white/10 text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Received
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search schedules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Next Release
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loadingSchedules ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      <span className="text-gray-400">
                        Loading schedules...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No vesting schedules found</p>
                      <p className="text-sm mt-1">
                        {activeTab === "sent"
                          ? "Create your first vesting schedule to get started"
                          : "No received schedules yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                schedules.map((schedule) => (
                  <motion.tr
                    key={schedule.scheduleId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setShowScheduleModal(true);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {schedule.contractTitle ||
                            `Schedule #${schedule.scheduleId}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatScheduleTime(schedule.startTime)} -{" "}
                          {formatScheduleTime(schedule.endTime)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {truncateWalletAddress(schedule.recipient.toString())}
                        </p>
                        <p className="text-xs text-gray-400">
                          {schedule.recipientEmail || "No email"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">
                        {formatAmount(
                          schedule.totalAmount,
                          schedule.tokenDecimals || 18
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        Released:{" "}
                        {formatAmount(
                          schedule.releasedAmount || 0,
                          schedule.tokenDecimals || 18
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(schedule)}`}
                      >
                        {getStatusText(schedule)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                            style={{
                              width: `${Math.min(getScheduleProgress(schedule), 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {getScheduleProgress(schedule).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {schedule.releasableAmount > 0
                          ? "Available"
                          : "Pending"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatAmount(
                          schedule.releasableAmount || 0,
                          schedule.tokenDecimals || 18
                        )}{" "}
                        releasable
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {schedule.releasableAmount > 0 &&
                          !schedule.cancelled && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReleaseTokens(schedule.scheduleId);
                              }}
                              disabled={vestingManager.isProcessing}
                              className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-all duration-200 disabled:opacity-50"
                              title="Release Tokens"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                        {!schedule.cancelled && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelSchedule(schedule.scheduleId);
                            }}
                            disabled={vestingManager.isProcessing}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all duration-200 disabled:opacity-50"
                            title="Cancel Schedule"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSchedule(schedule);
                            setShowScheduleModal(true);
                          }}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Detail Modal */}
      <AnimatePresence>
        {showScheduleModal && selectedSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1D2538] border border-[#475B74]/50 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#97CBDC]">
                  {selectedSchedule.contractTitle ||
                    `Schedule #${selectedSchedule.scheduleId}`}
                </h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-[#97CBDC]/70 hover:text-[#97CBDC] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status and Progress */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedSchedule)}`}
                  >
                    {getStatusText(selectedSchedule)}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#97CBDC]">
                      {getScheduleProgress(selectedSchedule).toFixed(1)}%
                    </div>
                    <div className="text-sm text-[#97CBDC]/70">Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-[#0a0a20] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(getScheduleProgress(selectedSchedule), 100)}%`,
                    }}
                  />
                </div>

                {/* Schedule Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#0a0a20]/50">
                    <div className="text-[#97CBDC]/70 text-sm mb-1">
                      Recipient
                    </div>
                    <div className="text-[#97CBDC] font-medium font-mono text-sm">
                      {selectedSchedule.recipient}
                    </div>
                    {selectedSchedule.recipientEmail && (
                      <div className="text-[#97CBDC]/70 text-xs mt-1">
                        {selectedSchedule.recipientEmail}
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-[#0a0a20]/50">
                    <div className="text-[#97CBDC]/70 text-sm mb-1">Sender</div>
                    <div className="text-[#97CBDC] font-medium font-mono text-sm">
                      {selectedSchedule.sender}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0a0a20]/50">
                    <div className="text-[#97CBDC]/70 text-sm mb-1">
                      Total Amount
                    </div>
                    <div className="text-[#97CBDC] font-medium">
                      {formatAmount(
                        selectedSchedule.totalAmount,
                        selectedSchedule.tokenDecimals || 18
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0a0a20]/50">
                    <div className="text-[#97CBDC]/70 text-sm mb-1">
                      Released Amount
                    </div>
                    <div className="text-[#97CBDC] font-medium">
                      {formatAmount(
                        selectedSchedule.releasedAmount || 0,
                        selectedSchedule.tokenDecimals || 18
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0a0a20]/50">
                    <div className="text-[#97CBDC]/70 text-sm mb-1">
                      Releasable Amount
                    </div>
                    <div className="text-green-400 font-medium">
                      {formatAmount(
                        selectedSchedule.releasableAmount || 0,
                        selectedSchedule.tokenDecimals || 18
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0a0a20]/50">
                    <div className="text-[#97CBDC]/70 text-sm mb-1">
                      Unlock Schedule
                    </div>
                    <div className="text-[#97CBDC] font-medium">
                      {vestingManager.getUnlockScheduleText?.(
                        selectedSchedule.unlockSchedule
                      ) || "Daily"}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-3 rounded-lg bg-[#0a0a20]/50">
                  <div className="text-[#97CBDC]/70 text-sm mb-2">Timeline</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#97CBDC]/70">Start:</span>
                      <span className="text-[#97CBDC]">
                        {formatScheduleTime(selectedSchedule.startTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#97CBDC]/70">End:</span>
                      <span className="text-[#97CBDC]">
                        {formatScheduleTime(selectedSchedule.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {!selectedSchedule.cancelled &&
                    selectedSchedule.releasableAmount > 0 && (
                      <button
                        onClick={() => {
                          handleReleaseTokens(selectedSchedule.scheduleId);
                          setShowScheduleModal(false);
                        }}
                        disabled={vestingManager.isProcessing}
                        className="flex-1 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {vestingManager.isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Release Tokens
                          </>
                        )}
                      </button>
                    )}

                  {!selectedSchedule.cancelled && (
                    <button
                      onClick={() => {
                        handleCancelSchedule(selectedSchedule.scheduleId);
                        setShowScheduleModal(false);
                      }}
                      disabled={vestingManager.isProcessing}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      Cancel Schedule
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
