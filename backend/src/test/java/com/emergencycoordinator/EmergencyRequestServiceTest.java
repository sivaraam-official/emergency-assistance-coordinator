package com.emergencycoordinator;
import static org.junit.jupiter.api.Assertions.*;
import com.emergencycoordinator.dto.CreateEmergencyRequestDTO; import com.emergencycoordinator.exception.*; import com.emergencycoordinator.model.*; import com.emergencycoordinator.service.*;
import org.junit.jupiter.api.*;
class EmergencyRequestServiceTest {
    PriorityService ps; ResponderService rs; EmergencyRequestService svc;
    @BeforeEach void setUp() { ps = new PriorityService(); rs = new ResponderService(); svc = new EmergencyRequestService(ps, rs); }
    EmergencyRequest make(EmergencyPriority p) { return svc.create(new CreateEmergencyRequestDTO("Asha", "9876543210", EmergencyType.FIRE, "Main St", "Smoke", p)); }
    @Test void createsWithUniqueIds() { assertNotEquals(make(EmergencyPriority.LOW).getRequestId(), make(EmergencyPriority.LOW).getRequestId()); }
    @Test void sortsByPriorityThenCreationTime() throws Exception {
        EmergencyRequest low = make(EmergencyPriority.LOW); Thread.sleep(5); EmergencyRequest c1 = make(EmergencyPriority.CRITICAL); Thread.sleep(5); EmergencyRequest c2 = make(EmergencyPriority.CRITICAL);
        var q = svc.getActive(); assertEquals(c1, q.get(0)); assertEquals(c2, q.get(1)); assertEquals(low, q.get(2));
    }
    @Test void priorityUpdateReordersWithoutStaleEntries() { EmergencyRequest a = make(EmergencyPriority.LOW); make(EmergencyPriority.HIGH); svc.updatePriority(a.getRequestId(), EmergencyPriority.CRITICAL); assertEquals(2, svc.getActive().size()); assertEquals(a, svc.getActive().get(0)); }
    @Test void assignsAndBlocksDuplicateResponder() {
        EmergencyRequest a = make(EmergencyPriority.HIGH), b = make(EmergencyPriority.HIGH);
        svc.assign(a.getRequestId(), "R-101"); assertEquals(EmergencyStatus.ASSIGNED, a.getStatus());
        assertThrows(InvalidRequestException.class, () -> svc.assign(b.getRequestId(), "R-101"));
    }
    @Test void resolveFreesResponderAndLeavesQueue() {
        EmergencyRequest a = make(EmergencyPriority.HIGH); svc.assign(a.getRequestId(), "R-101"); svc.updateStatus(a.getRequestId(), EmergencyStatus.IN_PROGRESS); svc.updateStatus(a.getRequestId(), EmergencyStatus.RESOLVED);
        assertTrue(rs.get("R-101").isAvailable()); assertTrue(svc.getActive().isEmpty());
        assertThrows(InvalidRequestException.class, () -> svc.updateStatus(a.getRequestId(), EmergencyStatus.PENDING));
    }
    @Test void cancelFreesResponder() { EmergencyRequest a = make(EmergencyPriority.LOW); svc.assign(a.getRequestId(), "R-102"); svc.cancel(a.getRequestId()); assertTrue(rs.get("R-102").isAvailable()); }
    @Test void nonexistentIdsRejected() { assertThrows(ResourceNotFoundException.class, () -> svc.get("ER-0")); assertThrows(ResourceNotFoundException.class, () -> svc.cancel("ER-0")); }
    @Test void nullBodyRejected() { assertThrows(InvalidRequestException.class, () -> svc.create(null)); }
    @Test void timelineRecordsLifecycle() { EmergencyRequest a = make(EmergencyPriority.HIGH); svc.assign(a.getRequestId(), "R-101"); svc.updateStatus(a.getRequestId(), EmergencyStatus.IN_PROGRESS); assertEquals(3, a.getTimeline().size()); }
    @Test void notesAndSearchWork() { EmergencyRequest a = make(EmergencyPriority.LOW); svc.addNote(a.getRequestId(), "Caller called back"); assertEquals(1, a.getNotes().size()); assertEquals(1, svc.search("main st").size()); assertEquals(0, svc.search("zzz").size()); assertThrows(InvalidRequestException.class, () -> svc.addNote(a.getRequestId(), "  ")); }
}
