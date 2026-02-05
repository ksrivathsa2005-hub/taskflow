import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { ApiService, LocationArea, LocationCity, LocationFull, LocationState } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskStatusTimelineComponent } from '../../components/task-status-timeline/task-status-timeline.component';
import { ReviewModalComponent } from '../../components/review-modal/review-modal.component';
import { PlatformActivityComponent } from '../../components/platform-activity/platform-activity.component';
import { Task, TaskStatus, UserRole, Bid } from '../../types';
import { STATUS_COLORS, CURRENCY } from '../../constants';
import {
    LucideAngularModule,
    Plus,
    AlertCircle,
    CheckCircle,
    CheckCircle2,
    Clock,
    ChevronDown,
    ChevronUp,
    Search,
    ChevronRight,
    X,
    Star
} from 'lucide-angular';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Component({
    selector: 'app-customer-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, TaskCardComponent, TaskStatusTimelineComponent, ReviewModalComponent, PlatformActivityComponent],
    templateUrl: './customer-dashboard.component.html',
    styleUrls: ['./customer-dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDashboardComponent implements OnInit {
    currentUser: any = null;
    selectedTaskTab = 'All';
    myTasks: Task[] = [];
    expandedTaskIds: Set<string> = new Set();
    selectedTask: Task | null = null;
    isPostingTask = false;
    showCompletedTasks = false;
    selectedStateId = '';
    selectedCityId = '';
    selectedAreaId = '';
    fullAddress = '';
    availableCities: LocationCity[] = [];
    availableAreas: LocationArea[] = [];
    availableStates: LocationState[] = [];
    selectedLatitude?: number;
    selectedLongitude?: number;
    showReviewModal = false;
    reviewingWorkerId = '';
    reviewingTaskId = '';
    bidSortOrder: 'asc' | 'desc' = 'asc';

    readonly TaskStatus = TaskStatus;
    readonly STATUS_COLORS = STATUS_COLORS;
    readonly CURRENCY = CURRENCY;
    readonly UserRole = UserRole;

    readonly Plus = Plus;
    readonly AlertCircle = AlertCircle;
    readonly CheckCircle = CheckCircle;
    readonly CheckCircle2 = CheckCircle2;
    readonly Clock = Clock;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly Search = Search;
    readonly ChevronRight = ChevronRight;
    readonly X = X;
    readonly Star = Star;

    private apiService = inject(ApiService);
    private authService = inject(AuthService);

    private tasksSubject = new BehaviorSubject<Task[]>([]);
    readonly customerTasks$ = this.tasksSubject.asObservable();

    private readonly fallbackStates: LocationState[] = [
        { id: 'MH', name: 'Maharashtra', code: 'MH' },
        { id: 'DL', name: 'Delhi', code: 'DL' },
        { id: 'KA', name: 'Karnataka', code: 'KA' },
        { id: 'TN', name: 'Tamil Nadu', code: 'TN' },
        { id: 'GJ', name: 'Gujarat', code: 'GJ' },
        { id: 'RJ', name: 'Rajasthan', code: 'RJ' },
        { id: 'UP', name: 'Uttar Pradesh', code: 'UP' },
        { id: 'WB', name: 'West Bengal', code: 'WB' },
        { id: 'TG', name: 'Telangana', code: 'TG' },
        { id: 'KL', name: 'Kerala', code: 'KL' },
        { id: 'AP', name: 'Andhra Pradesh', code: 'AP' },
        { id: 'PB', name: 'Punjab', code: 'PB' },
        { id: 'HR', name: 'Haryana', code: 'HR' },
        { id: 'MP', name: 'Madhya Pradesh', code: 'MP' },
        { id: 'BR', name: 'Bihar', code: 'BR' },
        { id: 'OD', name: 'Odisha', code: 'OD' },
        { id: 'JH', name: 'Jharkhand', code: 'JH' },
        { id: 'AS', name: 'Assam', code: 'AS' },
        { id: 'CH', name: 'Chandigarh', code: 'CH' },
        { id: 'GA', name: 'Goa', code: 'GA' }
    ];

    private readonly fallbackCitiesByStateId: Record<string, LocationCity[]> = {
        MH: [
            { id: 'MUM', name: 'Mumbai', stateId: 'MH', latitude: 19.0760, longitude: 72.8777 },
            { id: 'PUN', name: 'Pune', stateId: 'MH', latitude: 18.5204, longitude: 73.8567 }
        ],
        DL: [
            { id: 'DEL', name: 'New Delhi', stateId: 'DL', latitude: 28.6139, longitude: 77.2090 },
            { id: 'NOD', name: 'Noida', stateId: 'DL', latitude: 28.5355, longitude: 77.3910 }
        ],
        KA: [
            { id: 'BLR', name: 'Bangalore', stateId: 'KA', latitude: 12.9716, longitude: 77.5946 },
            { id: 'MYS', name: 'Mysore', stateId: 'KA', latitude: 12.2958, longitude: 76.6394 }
        ],
        TN: [
            { id: 'CHN', name: 'Chennai', stateId: 'TN', latitude: 13.0827, longitude: 80.2707 },
            { id: 'CBE', name: 'Coimbatore', stateId: 'TN', latitude: 11.0168, longitude: 76.9558 }
        ],
        GJ: [
            { id: 'AMD', name: 'Ahmedabad', stateId: 'GJ', latitude: 23.0225, longitude: 72.5714 },
            { id: 'STV', name: 'Surat', stateId: 'GJ', latitude: 21.1702, longitude: 72.8311 }
        ],
        RJ: [
            { id: 'JAI', name: 'Jaipur', stateId: 'RJ', latitude: 26.9124, longitude: 75.7873 },
            { id: 'JOD', name: 'Jodhpur', stateId: 'RJ', latitude: 26.2389, longitude: 73.0243 }
        ],
        UP: [
            { id: 'LKO', name: 'Lucknow', stateId: 'UP', latitude: 26.8467, longitude: 80.9462 },
            { id: 'KNP', name: 'Kanpur', stateId: 'UP', latitude: 26.4499, longitude: 80.3319 }
        ],
        WB: [
            { id: 'KOL', name: 'Kolkata', stateId: 'WB', latitude: 22.5726, longitude: 88.3639 },
            { id: 'SLG', name: 'Siliguri', stateId: 'WB', latitude: 26.7271, longitude: 88.3953 }
        ],
        TG: [
            { id: 'HYD', name: 'Hyderabad', stateId: 'TG', latitude: 17.3850, longitude: 78.4867 },
            { id: 'WRL', name: 'Warangal', stateId: 'TG', latitude: 18.0000, longitude: 79.5882 }
        ],
        KL: [
            { id: 'KOC', name: 'Kochi', stateId: 'KL', latitude: 9.9312, longitude: 76.2673 },
            { id: 'TVM', name: 'Thiruvananthapuram', stateId: 'KL', latitude: 8.5241, longitude: 76.9366 }
        ],
        AP: [
            { id: 'BVR', name: 'Bhimavaram', stateId: 'AP', latitude: 16.5449, longitude: 81.5212 },
            { id: 'VSK', name: 'Visakhapatnam', stateId: 'AP', latitude: 17.6868, longitude: 83.2185 }
        ],
        PB: [
            { id: 'LUD', name: 'Ludhiana', stateId: 'PB', latitude: 30.9010, longitude: 75.8573 },
            { id: 'ASR', name: 'Amritsar', stateId: 'PB', latitude: 31.6340, longitude: 74.8723 }
        ],
        HR: [
            { id: 'GGN', name: 'Gurugram', stateId: 'HR', latitude: 28.4595, longitude: 77.0266 },
            { id: 'FBD', name: 'Faridabad', stateId: 'HR', latitude: 28.4089, longitude: 77.3178 }
        ],
        MP: [
            { id: 'BHO', name: 'Bhopal', stateId: 'MP', latitude: 23.2599, longitude: 77.4126 },
            { id: 'IDR', name: 'Indore', stateId: 'MP', latitude: 22.7196, longitude: 75.8577 }
        ],
        BR: [
            { id: 'PAT', name: 'Patna', stateId: 'BR', latitude: 25.5941, longitude: 85.1376 },
            { id: 'GYA', name: 'Gaya', stateId: 'BR', latitude: 24.7914, longitude: 85.0002 }
        ],
        OD: [
            { id: 'BBI', name: 'Bhubaneswar', stateId: 'OD', latitude: 20.2961, longitude: 85.8245 },
            { id: 'CTC', name: 'Cuttack', stateId: 'OD', latitude: 20.4625, longitude: 85.8830 }
        ],
        JH: [
            { id: 'IXR', name: 'Ranchi', stateId: 'JH', latitude: 23.3441, longitude: 85.3096 },
            { id: 'IXW', name: 'Jamshedpur', stateId: 'JH', latitude: 22.8046, longitude: 86.2029 }
        ],
        AS: [
            { id: 'GAU', name: 'Guwahati', stateId: 'AS', latitude: 26.1445, longitude: 91.7362 },
            { id: 'JOR', name: 'Jorhat', stateId: 'AS', latitude: 26.7465, longitude: 94.2026 }
        ],
        CH: [
            { id: 'CHD', name: 'Chandigarh', stateId: 'CH', latitude: 30.7333, longitude: 76.7794 }
        ],
        GA: [
            { id: 'PJI', name: 'Panaji', stateId: 'GA', latitude: 15.4909, longitude: 73.8278 },
            { id: 'MRG', name: 'Margao', stateId: 'GA', latitude: 15.2750, longitude: 73.9580 }
        ]
    };

    private readonly fallbackAreasByCityId: Record<string, LocationArea[]> = {
        MUM: [
            { id: 'MUM_AND', name: 'Andheri', cityId: 'MUM', pincode: '400053', latitude: 19.1364, longitude: 72.8296 },
            { id: 'MUM_BAN', name: 'Bandra', cityId: 'MUM', pincode: '400050', latitude: 19.0596, longitude: 72.8295 }
        ],
        PUN: [
            { id: 'PUN_HIN', name: 'Hinjewadi', cityId: 'PUN', pincode: '411057', latitude: 18.5913, longitude: 73.7389 },
            { id: 'PUN_KHR', name: 'Kharadi', cityId: 'PUN', pincode: '411014', latitude: 18.5525, longitude: 73.9497 }
        ],
        DEL: [
            { id: 'DEL_CNG', name: 'Connaught Place', cityId: 'DEL', pincode: '110001', latitude: 28.6315, longitude: 77.2167 },
            { id: 'DEL_SKT', name: 'Saket', cityId: 'DEL', pincode: '110017', latitude: 28.5244, longitude: 77.2066 }
        ],
        NOD: [
            { id: 'NOD_S62', name: 'Sector 62', cityId: 'NOD', pincode: '201301', latitude: 28.6280, longitude: 77.3649 },
            { id: 'NOD_S18', name: 'Sector 18', cityId: 'NOD', pincode: '201301', latitude: 28.5708, longitude: 77.3260 }
        ],
        BLR: [
            { id: 'BLR_KOR', name: 'Koramangala', cityId: 'BLR', pincode: '560034', latitude: 12.9352, longitude: 77.6245 },
            { id: 'BLR_IND', name: 'Indiranagar', cityId: 'BLR', pincode: '560038', latitude: 12.9719, longitude: 77.6412 }
        ],
        MYS: [
            { id: 'MYS_JGN', name: 'Jaganmohan Palace', cityId: 'MYS', pincode: '570024', latitude: 12.3052, longitude: 76.6552 },
            { id: 'MYS_VVP', name: 'Vijayanagar', cityId: 'MYS', pincode: '570017', latitude: 12.3130, longitude: 76.6130 }
        ],
        CHN: [
            { id: 'CHN_ADY', name: 'Adyar', cityId: 'CHN', pincode: '600020', latitude: 13.0067, longitude: 80.2570 },
            { id: 'CHN_TNR', name: 'T Nagar', cityId: 'CHN', pincode: '600017', latitude: 13.0400, longitude: 80.2337 }
        ],
        CBE: [
            { id: 'CBE_GPD', name: 'Gandhipuram', cityId: 'CBE', pincode: '641012', latitude: 11.0176, longitude: 76.9674 },
            { id: 'CBE_RSP', name: 'RS Puram', cityId: 'CBE', pincode: '641002', latitude: 11.0109, longitude: 76.9470 }
        ],
        AMD: [
            { id: 'AMD_NAV', name: 'Navrangpura', cityId: 'AMD', pincode: '380009', latitude: 23.0376, longitude: 72.5615 },
            { id: 'AMD_SAT', name: 'Satellite', cityId: 'AMD', pincode: '380015', latitude: 23.0271, longitude: 72.5173 }
        ],
        STV: [
            { id: 'STV_ADJ', name: 'Adajan', cityId: 'STV', pincode: '395009', latitude: 21.1900, longitude: 72.7940 },
            { id: 'STV_VES', name: 'Vesu', cityId: 'STV', pincode: '395007', latitude: 21.1523, longitude: 72.7688 }
        ],
        JAI: [
            { id: 'JAI_MLI', name: 'Malviya Nagar', cityId: 'JAI', pincode: '302017', latitude: 26.8457, longitude: 75.8123 },
            { id: 'JAI_VNV', name: 'Vaishali Nagar', cityId: 'JAI', pincode: '302021', latitude: 26.9021, longitude: 75.7406 }
        ],
        JOD: [
            { id: 'JOD_CHB', name: 'Chopasni Housing Board', cityId: 'JOD', pincode: '342008', latitude: 26.2380, longitude: 73.0170 },
            { id: 'JOD_RTN', name: 'Ratanada', cityId: 'JOD', pincode: '342011', latitude: 26.2650, longitude: 73.0110 }
        ],
        LKO: [
            { id: 'LKO_GMR', name: 'Gomti Nagar', cityId: 'LKO', pincode: '226010', latitude: 26.8461, longitude: 81.0166 },
            { id: 'LKO_ALB', name: 'Alambagh', cityId: 'LKO', pincode: '226005', latitude: 26.7922, longitude: 80.9267 }
        ],
        KNP: [
            { id: 'KNP_KDK', name: 'Kidwai Nagar', cityId: 'KNP', pincode: '208011', latitude: 26.4350, longitude: 80.3400 },
            { id: 'KNP_SWR', name: 'Swaroop Nagar', cityId: 'KNP', pincode: '208002', latitude: 26.4800, longitude: 80.3200 }
        ],
        KOL: [
            { id: 'KOL_SLT', name: 'Salt Lake', cityId: 'KOL', pincode: '700064', latitude: 22.5860, longitude: 88.4170 },
            { id: 'KOL_BAL', name: 'Ballygunge', cityId: 'KOL', pincode: '700019', latitude: 22.5250, longitude: 88.3650 }
        ],
        SLG: [
            { id: 'SLG_MTN', name: 'Matigara', cityId: 'SLG', pincode: '734010', latitude: 26.7070, longitude: 88.3900 },
            { id: 'SLG_HKJ', name: 'Hakimpara', cityId: 'SLG', pincode: '734001', latitude: 26.7180, longitude: 88.4250 }
        ],
        HYD: [
            { id: 'HYD_HIT', name: 'Hitech City', cityId: 'HYD', pincode: '500081', latitude: 17.4483, longitude: 78.3915 },
            { id: 'HYD_BHL', name: 'Banjara Hills', cityId: 'HYD', pincode: '500034', latitude: 17.4120, longitude: 78.4483 }
        ],
        WRL: [
            { id: 'WRL_HAN', name: 'Hanamkonda', cityId: 'WRL', pincode: '506001', latitude: 18.0050, longitude: 79.5550 },
            { id: 'WRL_KZI', name: 'Kazipet', cityId: 'WRL', pincode: '506003', latitude: 17.9689, longitude: 79.5030 }
        ],
        KOC: [
            { id: 'KOC_KAK', name: 'Kakkanad', cityId: 'KOC', pincode: '682030', latitude: 10.0169, longitude: 76.3419 },
            { id: 'KOC_KLM', name: 'Kaloor', cityId: 'KOC', pincode: '682017', latitude: 9.9916, longitude: 76.2912 }
        ],
        TVM: [
            { id: 'TVM_KOW', name: 'Kowdiar', cityId: 'TVM', pincode: '695003', latitude: 8.5241, longitude: 76.9366 },
            { id: 'TVM_PTS', name: 'Pattom', cityId: 'TVM', pincode: '695004', latitude: 8.5400, longitude: 76.9480 }
        ],
        BVR: [
            { id: 'BVR_CTR', name: 'Town Center', cityId: 'BVR', pincode: '534201', latitude: 16.5449, longitude: 81.5212 },
            { id: 'BVR_RLY', name: 'Railway Station', cityId: 'BVR', pincode: '534202', latitude: 16.5433, longitude: 81.5239 }
        ],
        VSK: [
            { id: 'VSK_MVP', name: 'MVP Colony', cityId: 'VSK', pincode: '530017', latitude: 17.7334, longitude: 83.3190 },
            { id: 'VSK_DRP', name: 'Dwaraka Nagar', cityId: 'VSK', pincode: '530016', latitude: 17.7274, longitude: 83.3083 }
        ],
        LUD: [
            { id: 'LUD_SBP', name: 'Sarabha Nagar', cityId: 'LUD', pincode: '141001', latitude: 30.9010, longitude: 75.8573 },
            { id: 'LUD_CPR', name: 'Civil Lines', cityId: 'LUD', pincode: '141001', latitude: 30.9150, longitude: 75.8460 }
        ],
        ASR: [
            { id: 'ASR_RNJ', name: 'Ranjit Avenue', cityId: 'ASR', pincode: '143001', latitude: 31.6340, longitude: 74.8723 },
            { id: 'ASR_LWR', name: 'Lawrence Road', cityId: 'ASR', pincode: '143001', latitude: 31.6350, longitude: 74.8750 }
        ],
        GGN: [
            { id: 'GGN_S56', name: 'Sector 56', cityId: 'GGN', pincode: '122011', latitude: 28.4333, longitude: 77.1060 },
            { id: 'GGN_DLF', name: 'DLF Phase 3', cityId: 'GGN', pincode: '122002', latitude: 28.4936, longitude: 77.0900 }
        ],
        FBD: [
            { id: 'FBD_SEC', name: 'Sector 15', cityId: 'FBD', pincode: '121007', latitude: 28.3860, longitude: 77.3210 },
            { id: 'FBD_NIT', name: 'NIT', cityId: 'FBD', pincode: '121001', latitude: 28.4010, longitude: 77.3070 }
        ],
        BHO: [
            { id: 'BHO_ARC', name: 'Arera Colony', cityId: 'BHO', pincode: '462016', latitude: 23.2140, longitude: 77.4340 },
            { id: 'BHO_HBR', name: 'Habibganj', cityId: 'BHO', pincode: '462016', latitude: 23.2100, longitude: 77.4360 }
        ],
        IDR: [
            { id: 'IDR_VIJ', name: 'Vijay Nagar', cityId: 'IDR', pincode: '452010', latitude: 22.7530, longitude: 75.8930 },
            { id: 'IDR_PLA', name: 'Palasia', cityId: 'IDR', pincode: '452001', latitude: 22.7250, longitude: 75.8820 }
        ],
        PAT: [
            { id: 'PAT_BOR', name: 'Boring Road', cityId: 'PAT', pincode: '800001', latitude: 25.6090, longitude: 85.1280 },
            { id: 'PAT_KAN', name: 'Kankarbagh', cityId: 'PAT', pincode: '800020', latitude: 25.6020, longitude: 85.1440 }
        ],
        GYA: [
            { id: 'GYA_JPR', name: 'Jagjivan Nagar', cityId: 'GYA', pincode: '823001', latitude: 24.7840, longitude: 85.0000 },
            { id: 'GYA_BOD', name: 'Bodhgaya Road', cityId: 'GYA', pincode: '823001', latitude: 24.7780, longitude: 85.0050 }
        ],
        BBI: [
            { id: 'BBI_JNA', name: 'Jayadev Vihar', cityId: 'BBI', pincode: '751013', latitude: 20.2961, longitude: 85.8245 },
            { id: 'BBI_PPT', name: 'Patia', cityId: 'BBI', pincode: '751024', latitude: 20.3499, longitude: 85.8103 }
        ],
        CTC: [
            { id: 'CTC_MGL', name: 'Mangalabag', cityId: 'CTC', pincode: '753001', latitude: 20.4640, longitude: 85.8790 },
            { id: 'CTC_BAD', name: 'Badambadi', cityId: 'CTC', pincode: '753009', latitude: 20.4596, longitude: 85.8796 }
        ],
        IXR: [
            { id: 'IXR_ALB', name: 'Alam Nagar', cityId: 'IXR', pincode: '834001', latitude: 23.3441, longitude: 85.3096 },
            { id: 'IXR_HIN', name: 'Hinoo', cityId: 'IXR', pincode: '834002', latitude: 23.3390, longitude: 85.3314 }
        ],
        IXW: [
            { id: 'IXW_SAK', name: 'Sakchi', cityId: 'IXW', pincode: '831001', latitude: 22.8046, longitude: 86.2029 },
            { id: 'IXW_BST', name: 'Bistupur', cityId: 'IXW', pincode: '831001', latitude: 22.7961, longitude: 86.1855 }
        ],
        GAU: [
            { id: 'GAU_PALT', name: 'Paltan Bazaar', cityId: 'GAU', pincode: '781008', latitude: 26.1810, longitude: 91.7440 },
            { id: 'GAU_ULB', name: 'Ulubari', cityId: 'GAU', pincode: '781007', latitude: 26.1760, longitude: 91.7530 }
        ],
        JOR: [
            { id: 'JOR_TAT', name: 'Tarajan', cityId: 'JOR', pincode: '785001', latitude: 26.7465, longitude: 94.2026 },
            { id: 'JOR_GHB', name: 'Garmur', cityId: 'JOR', pincode: '785007', latitude: 26.7600, longitude: 94.1880 }
        ],
        CHD: [
            { id: 'CHD_S17', name: 'Sector 17', cityId: 'CHD', pincode: '160017', latitude: 30.7417, longitude: 76.7821 },
            { id: 'CHD_S35', name: 'Sector 35', cityId: 'CHD', pincode: '160035', latitude: 30.7225, longitude: 76.7675 }
        ],
        PJI: [
            { id: 'PJI_CMP', name: 'Campal', cityId: 'PJI', pincode: '403001', latitude: 15.4980, longitude: 73.8250 },
            { id: 'PJI_MIR', name: 'Miramar', cityId: 'PJI', pincode: '403001', latitude: 15.4840, longitude: 73.8070 }
        ],
        MRG: [
            { id: 'MRG_FAT', name: 'Fatorda', cityId: 'MRG', pincode: '403602', latitude: 15.2800, longitude: 73.9600 },
            { id: 'MRG_BEB', name: 'Bebdo', cityId: 'MRG', pincode: '403601', latitude: 15.2780, longitude: 73.9560 }
        ]
    };

    constructor(public appService: AppService, public router: Router) {}

    ngOnInit() {
        this.loadStates();
        // Get current user from AuthService
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user) {
                this.loadTasks();
            }
        });
    }

    loadTasks() {
        if (!this.currentUser?.id) return;

        // Fetch tasks from API for current customer
        this.apiService.getTasks({ customerId: this.currentUser.id }).subscribe({
            next: (response) => {
                this.myTasks = response.data.map(apiTask => this.convertApiTask(apiTask));
                this.tasksSubject.next(this.myTasks);
            },
            error: (error) => {
                console.error('Error loading tasks:', error);
                this.myTasks = [];
                this.tasksSubject.next([]);
            }
        });
    }

    private convertApiTask(apiTask: any): Task {
        return {
            ...apiTask,
            photos: Array.isArray(apiTask.photos) 
                ? apiTask.photos.map((p: any) => typeof p === 'string' ? p : p.photoUrl)
                : [],
            location: apiTask.location || {
                state: '',
                city: '',
                area: '',
                fullAddress: ''
            }
        };
    }

    getPendingActions(): Observable<Task[]> {
        return this.customerTasks$.pipe(
            map(tasks => {
                const userTasks = tasks.filter(t => t.customerId === this.appService.currentUser?.id);
                
                // Filter tasks that need action
                const pendingTasks = userTasks.filter(t => {
                    // Tasks with bids pending review
                    if (t.status === TaskStatus.POSTED && t.bids.length > 0) return true;
                    
                    // Tasks waiting for work completion approval
                    if (t.status === TaskStatus.WORK_COMPLETED) return true;
                    
                    // Tasks waiting for review after verification
                    if (t.status === TaskStatus.VERIFIED && !this.hasReview(t)) return true;
                    
                    // Tasks with payment status
                    if (t.status === TaskStatus.PAID) return true;
                    
                    return false;
                });
                
                return pendingTasks.sort((a, b) => 
                    new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime()
                );
            })
        );
    }

    getTaskProgress(task: Task): number {
        const statusProgression = [
            TaskStatus.POSTED, TaskStatus.BIDDING, TaskStatus.ASSIGNED, 
            TaskStatus.CONFIRMED, TaskStatus.TRAVELING, TaskStatus.ARRIVED,
            TaskStatus.IN_PROGRESS, TaskStatus.WORK_COMPLETED, TaskStatus.VERIFIED,
            TaskStatus.PAID, TaskStatus.COMPLETED
        ];
        
        const currentIndex = statusProgression.indexOf(task.status as TaskStatus);
        if (currentIndex === -1) return 0;
        
        return Math.round((currentIndex / (statusProgression.length - 1)) * 100);
    }

    getPendingActionText(task: Task): string {
        switch (task.status) {
            case TaskStatus.POSTED:
                return `${task.bids.length} bid${task.bids.length !== 1 ? 's' : ''} received`;
            case TaskStatus.WORK_COMPLETED:
                return 'Awaiting approval';
            case TaskStatus.VERIFIED:
                return 'Review pending';
            case TaskStatus.PAID:
                return 'Payment done';
            default:
                return this.formatStatus(task.status);
        }
    }

    hasReview(task: Task): boolean {
        return this.appService.currentUser && (task as any).reviews?.some(
            (r: any) => r.reviewerId === this.appService.currentUser?.id
        );
    }

    toggleExpandedTask(taskId: string) {
        if (this.expandedTaskIds.has(taskId)) {
            this.expandedTaskIds.delete(taskId);
        } else {
            this.expandedTaskIds.add(taskId);
        }
    }

    isTaskExpanded(taskId: string): boolean {
        return this.expandedTaskIds.has(taskId);
    }

    getFilteredTasks(): Observable<Task[]> {
        return this.customerTasks$.pipe(
            map(tasks => {
                let filtered = tasks.filter(t => t.customerId === this.appService.currentUser?.id);

                switch (this.selectedTaskTab) {
                    case 'Active':
                        filtered = filtered.filter(t => 
                            [TaskStatus.BIDDING, TaskStatus.ASSIGNED, TaskStatus.CONFIRMED,
                             TaskStatus.TRAVELING, TaskStatus.ARRIVED, TaskStatus.IN_PROGRESS].includes(t.status as TaskStatus)
                        );
                        break;
                    case 'Pending':
                        filtered = filtered.filter(t => t.status === TaskStatus.POSTED);
                        break;
                    case 'Completed':
                        filtered = filtered.filter(t => t.status === TaskStatus.COMPLETED);
                        break;
                    case 'Cancelled':
                        filtered = filtered.filter(t => t.status === TaskStatus.CANCELLED);
                        break;
                }

                return filtered.sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime());
            })
        );
    }

    formatStatus(status: string): string {
        return status.replace(/_/g, ' ');
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    get completedTasks(): Task[] {
        return this.myTasks.filter(t => t.status === TaskStatus.COMPLETED);
    }

    get CATEGORIES() {
        return this.appService.getServiceCategories();
    }

    private loadStates() {
        this.apiService.getLocationStates().subscribe({
            next: (response) => {
                this.availableStates = response.data?.length ? response.data : this.fallbackStates;
            },
            error: (error) => {
                console.error('Error loading states:', error);
                this.availableStates = this.fallbackStates;
            }
        });
    }

    setSelectedTask(task: Task | null) {
        this.selectedTask = task;
    }

    togglePreviousBookings() {
        this.showCompletedTasks = !this.showCompletedTasks;
    }

    getStarArray(count: number): number[] {
        return Array(Math.floor(count)).fill(0);
    }

    getAverageRating(task: Task): number {
        const reviews = (task as any).reviews || [];
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        return +(sum / reviews.length).toFixed(1);
    }

    onStateChange() {
        this.selectedCityId = '';
        this.selectedAreaId = '';
        this.availableAreas = [];
        this.fullAddress = '';
        this.selectedLatitude = undefined;
        this.selectedLongitude = undefined;

        if (this.selectedStateId) {
            this.apiService.getLocationCities(this.selectedStateId).subscribe({
                next: (response) => {
                    const fallbackCities = this.fallbackCitiesByStateId[this.selectedStateId] || [];
                    this.availableCities = response.data?.length ? response.data : fallbackCities;
                },
                error: (error) => {
                    console.error('Error loading cities:', error);
                    this.availableCities = this.fallbackCitiesByStateId[this.selectedStateId] || [];
                }
            });
        } else {
            this.availableCities = [];
        }
    }

    onCityChange() {
        this.selectedAreaId = '';
        this.fullAddress = '';
        this.selectedLatitude = undefined;
        this.selectedLongitude = undefined;

        if (this.selectedCityId) {
            this.apiService.getLocationAreas(this.selectedCityId).subscribe({
                next: (response) => {
                    const fallbackAreas = this.fallbackAreasByCityId[this.selectedCityId] || [];
                    this.availableAreas = response.data?.length ? response.data : fallbackAreas;
                },
                error: (error) => {
                    console.error('Error loading areas:', error);
                    this.availableAreas = this.fallbackAreasByCityId[this.selectedCityId] || [];
                }
            });
        } else {
            this.availableAreas = [];
        }
    }

    onAreaChange() {
        this.selectedLatitude = undefined;
        this.selectedLongitude = undefined;

        if (!this.selectedAreaId) return;

        const area = this.availableAreas.find(a => a.id === this.selectedAreaId);
        if (area) {
            this.selectedLatitude = area.latitude;
            this.selectedLongitude = area.longitude;
        }

        if (!this.fullAddress) {
            if (this.fallbackAreasByCityId[this.selectedCityId]) {
                const cityName = this.getSelectedCityName();
                const stateName = this.getSelectedStateName();
                const pincode = area?.pincode ? ` ${area.pincode}` : '';
                const areaName = area?.name ?? '';
                this.fullAddress = [areaName, cityName, stateName].filter(Boolean).join(', ') + pincode;
                return;
            }

            this.apiService.getLocationFull(this.selectedAreaId).subscribe({
                next: (response: LocationFull) => {
                    if (!this.fullAddress) {
                        this.fullAddress = response.fullAddress;
                    }
                },
                error: (error) => {
                    console.error('Error loading full location:', error);
                }
            });
        }
    }

    handleSubmitTask(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const taskData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            budgetMin: Number(formData.get('budgetMin')),
            budgetMax: Number(formData.get('budgetMax')),
            preferredDate: formData.get('preferredDate') as string,
            location: {
                state: this.getSelectedStateName(),
                city: this.getSelectedCityName(),
                area: this.getSelectedAreaName(),
                fullAddress: this.fullAddress || (formData.get('fullAddress') as string),
                latitude: this.selectedLatitude,
                longitude: this.selectedLongitude
            }
        };

        this.apiService.createTask(taskData).subscribe({
            next: () => {
                this.loadTasks();
                this.isPostingTask = false;
                form.reset();
                this.selectedStateId = '';
                this.selectedCityId = '';
                this.selectedAreaId = '';
                this.fullAddress = '';
                this.availableCities = [];
                this.availableAreas = [];
                this.selectedLatitude = undefined;
                this.selectedLongitude = undefined;
            },
            error: (error) => {
                console.error('Error creating task:', error);
            }
        });
    }

    private getSelectedStateName(): string {
        return this.availableStates.find(state => state.id === this.selectedStateId)?.name ?? '';
    }

    private getSelectedCityName(): string {
        return this.availableCities.find(city => city.id === this.selectedCityId)?.name ?? '';
    }

    private getSelectedAreaName(): string {
        return this.availableAreas.find(area => area.id === this.selectedAreaId)?.name ?? '';
    }

    get sortedBids(): Bid[] {
        if (!this.selectedTask) return [];
        const bids = [...this.selectedTask.bids];
        return bids.sort((a, b) => {
            return this.bidSortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        });
    }

    toggleBidSort() {
        this.bidSortOrder = this.bidSortOrder === 'asc' ? 'desc' : 'asc';
    }

    selectWorker(taskId: string, bidId: string) {
        this.appService.acceptBid(taskId, bidId);
    }

    approveTask(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.VERIFIED);
    }

    openReviewModal(taskId: string, workerId: string | null | undefined) {
        if (workerId) {
            this.reviewingTaskId = taskId;
            this.reviewingWorkerId = workerId;
            this.showReviewModal = true;
        }
    }

    handleReviewSubmit(event: any) {
        console.log('Review submitted:', event);
        this.showReviewModal = false;
    }
}
