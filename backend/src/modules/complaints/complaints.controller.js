const complaintService = require('./complaints.service');
const response = require('../../utils/response');

// Public - no auth
const submitComplaint = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const result = await complaintService.submitComplaint(req.body, ip);

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(`company:${result.companyId || req.body.companyId}`).emit('complaint:new', {
        referenceNumber: result.referenceNumber,
        title: req.body.title,
        branchName: result.branchName,
        type: req.body.type || 'COMPLAINT',
      });
      io.to('super-admin').emit('complaint:new:platform', {
        companyName: result.companyName,
        referenceNumber: result.referenceNumber,
      });
    }

    return response.success(res, result, 'Complaint submitted successfully', 201);
  } catch (err) { next(err); }
};

// Company-scoped
const getComplaints = async (req, res, next) => {
  try {
    const { complaints, pagination } = await complaintService.getComplaints(req.tenantId, req.query);
    return response.paginated(res, complaints, pagination);
  } catch (err) { next(err); }
};

const getComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(req.tenantId, req.params.id);
    return response.success(res, complaint);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const result = await complaintService.updateComplaintStatus(
      req.tenantId, req.params.id, req.body.status, req.user.id
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`company:${req.tenantId}`).emit('complaint:updated', {
        complaintId: req.params.id,
        status: req.body.status,
      });
    }

    return response.success(res, result, 'Status updated');
  } catch (err) { next(err); }
};

const assignComplaint = async (req, res, next) => {
  try {
    const result = await complaintService.assignComplaint(
      req.tenantId, req.params.id, req.body.assignedToId, req.user.id
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`company:${req.tenantId}`).emit('complaint:assigned', {
        complaintId: req.params.id,
        assignedToId: req.body.assignedToId,
      });
    }

    return response.success(res, result, 'Complaint assigned');
  } catch (err) { next(err); }
};

const updatePriority = async (req, res, next) => {
  try {
    const result = await complaintService.updatePriority(req.tenantId, req.params.id, req.body.priority);
    return response.success(res, result, 'Priority updated');
  } catch (err) { next(err); }
};

const addNote = async (req, res, next) => {
  try {
    const note = await complaintService.addNote(
      req.tenantId, req.params.id, req.user.id, req.body.content, req.body.isInternal
    );
    return response.success(res, note, 'Note added', 201);
  } catch (err) { next(err); }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await complaintService.getDashboardStats(req.tenantId);
    return response.success(res, stats);
  } catch (err) { next(err); }
};

module.exports = {
  submitComplaint, getComplaints, getComplaint, updateStatus,
  assignComplaint, updatePriority, addNote, getDashboardStats,
};
