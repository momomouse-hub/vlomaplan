threads_count = ENV.fetch("RAILS_MAX_THREADS", 3)
threads threads_count, threads_count

# port ENV.fetch("PORT", 3000)

port_env = ENV.fetch("PORT", 3000)
bind "tcp://0.0.0.0:#{port_env}"

plugin :tmp_restart

pidfile ENV["PIDFILE"] if ENV["PIDFILE"]
