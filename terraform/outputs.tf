output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.sre_server.id
}

output "public_ip" {
  description = "Public IP address"
  value       = aws_eip.sre_eip.public_ip
}

output "instance_type" {
  description = "Instance type"
  value       = aws_instance.sre_server.instance_type
}

output "app_urls" {
  description = "Application URLs"
  value = {
    frontend   = "http://${aws_eip.sre_eip.public_ip}"
    grafana    = "http://${aws_eip.sre_eip.public_ip}:3000"
    prometheus = "http://${aws_eip.sre_eip.public_ip}:9090"
    auth_api   = "http://${aws_eip.sre_eip.public_ip}:8000"
    notes_api  = "http://${aws_eip.sre_eip.public_ip}:8001"
  }
}
