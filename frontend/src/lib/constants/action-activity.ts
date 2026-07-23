export const VISIT_PURPOSE = {
  COLLECTION:   "Penagihan",
  CONFIRMATION: "Konfirmasi Data",
  NEGOTIATION:  "Negosiasi / Restrukturisasi",
  REMINDER:     "Reminder Pembayaran",
  FOLLOW_UP:    "Kunjungan Ulang",
  INVESTIGATION:"Investigasi",
  COLLATERAL:   "Pengambilan Jaminan",
  SURVEY:       "Survey Lokasi / Usaha",
} as const;

export type VisitPurposeKey = keyof typeof VISIT_PURPOSE;

export const MEET_WITH = {
    DEBITUR: "Debitur",
    COUPLE: "Pasangan Debitur",
    FAMILY: "Keluarga",
    EMPLOYEE: "Karyawan",
    NEIGHBOR: "Tetangga",
    SECURITY: "Security",
    NOTHING: "Tidak Bertemu Siapapun"
}

export type MeetWithKey = keyof typeof MEET_WITH;

export const MEETING_LOCATION = {
    HOUSE: "Rumah Debitur",
    PARENT_HOUSE: "Rumah Orang Tua",
    RELATIVE_HOUSE: "Rumah Saudara",
    PLACE_OF_BUSSINESS: "Tempat Usaha",
    OFFICE: "Kantor",
    PUBLIC: "Tempat Umum",
    UNKNOWN: "Lokasi Tidak Diketahui",
    NONE: "Tidak Bertemu",
}

export type MeetingLocationKey = keyof typeof MEETING_LOCATION;

export const VISIT_RESULT = {
    PTP: "Janji Bayar",
    PAID_PARTIAL: "Bayar Sebagian",
    PAID_FULL: "Lunas",
    REFUSE: "Menolak Bayar",
    NOT_MET: "Tidak Bertemu",
    INVALID_ADDRESS: "Alamat Tidak Valid",
    DEBITUR_PINDAH: "Debitur Pindah",
    DEBITUR_TIDAK_MAMPU: "Tidak Mampu Bayar",
}

export type VisitResultKey = keyof typeof VISIT_RESULT; 

export const ACTION_PLAN = {
    FOLLOW_UP: "Follow Up",
    VISIT_AGAIN: "Kunjungan Ulang",
    CALL_REMINDER: "Reminder via Telepon",
    WAIT_PAYMENT: "Menunggu Pembayaran",
    RESTRUCTURE: "Proses Restrukturisasi",
    COLLATERAL_ACTION: "Tindakan Jaminan",
    LEGAL_PROCESS: "Proses Hukum",
    CLOSE_CASE: "Selesai",
}

export type ActionPlanKey = keyof typeof ACTION_PLAN;