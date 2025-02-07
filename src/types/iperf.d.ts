export interface Start {
  connected: Connected[];
  version: string;
  system_info: string;
  timestamp?: Timestamp;
  connecting_to?: ConnectingTo;
  cookie?: string;
  tcp_mss_default?: number;
  target_bitrate?: number;
  fq_rate?: number;
  sock_bufsize?: number;
  sndbuf_actual?: number;
  rcvbuf_actual?: number;
  test_start?: TestStart;
}

export interface Connected {
  socket: number;
  local_host: string;
  local_port: number;
  remote_host: string;
  remote_port: number;
}

export interface Timestamp {
  time: string;
  timesecs: number;
}

export interface ConnectingTo {
  host: string;
  port: number;
}

export interface TestStart {
  protocol: string;
  num_streams: number;
  blksize: number;
  omit: number;
  duration: number;
  bytes: number;
  blocks: number;
  reverse: number;
  tos: number;
  target_bitrate: number;
  bidir: number;
  fqrate: number;
  interval: number;
}

export interface Interval {
  streams: Stream[];
  sum: Sum;
}

export interface Stream {
  socket: number;
  start: number;
  end: number;
  seconds: number;
  bytes: number;
  bits_per_second: number;
  omitted: boolean;
  sender: boolean;
}

export interface Sum {
  start: number;
  end: number;
  seconds: number;
  bytes: number;
  bits_per_second: number;
  omitted: boolean;
  sender: boolean;
}

export interface End {
  streams: EndStream[];
  sum_sent: SumSent;
  sum_received: SumReceived;
  cpu_utilization_percent: CpuUtilizationPercent;
  receiver_tcp_congestion: string;
}

export interface EndStream {
  sender: Sender;
  receiver: Receiver;
}

export interface Sender {
  socket: number;
  start: number;
  end: number;
  seconds: number;
  bytes: number;
  bits_per_second: number;
  sender: boolean;
}

export interface Receiver {
  socket: number;
  start: number;
  end: number;
  seconds: number;
  bytes: number;
  bits_per_second: number;
  sender: boolean;
}

export interface SumSent {
  start: number;
  end: number;
  seconds: number;
  bytes: number;
  bits_per_second: number;
  sender: boolean;
}

export interface SumReceived {
  start: number;
  end: number;
  seconds: number;
  bytes: number;
  bits_per_second: number;
  sender: boolean;
}

export interface CpuUtilizationPercent {
  host_total: number;
  host_user: number;
  host_system: number;
  remote_total: number;
  remote_user: number;
  remote_system: number;
}

export interface IperfResponse {
  start: Start;
  intervals: Interval[];
  end: End | {};
  error?: string;
}
