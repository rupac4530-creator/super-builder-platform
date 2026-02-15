# Terraform — Engine Alto Cloud Infrastructure
# AWS EKS + GPU Nodes + S3 + RDS

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  default     = "production"
}

variable "cluster_name" {
  description = "EKS cluster name"
  default     = "engine-alto"
}

# ====== VPC ======
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.cluster_name}-vpc"
    Environment = var.environment
    Project     = "Engine Alto"
  }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = { Name = "${var.cluster_name}-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = { Name = "${var.cluster_name}-public-b" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.cluster_name}-igw" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "${var.cluster_name}-public-rt" }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# ====== S3 Storage ======
resource "aws_s3_bucket" "models" {
  bucket = "${var.cluster_name}-models-${var.environment}"
  tags   = { Name = "Engine Alto Models", Environment = var.environment }
}

resource "aws_s3_bucket" "assets" {
  bucket = "${var.cluster_name}-assets-${var.environment}"
  tags   = { Name = "Engine Alto Assets", Environment = var.environment }
}

resource "aws_s3_bucket_versioning" "models_versioning" {
  bucket = aws_s3_bucket.models.id
  versioning_configuration { status = "Enabled" }
}

# ====== RDS PostgreSQL ======
resource "aws_db_subnet_group" "main" {
  name       = "${var.cluster_name}-db-subnet"
  subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

resource "aws_db_instance" "postgres" {
  identifier           = "${var.cluster_name}-db"
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.t3.medium"
  allocated_storage    = 50
  db_name              = "alto_db"
  username             = "alto"
  password             = "change-this-in-production"
  db_subnet_group_name = aws_db_subnet_group.main.name
  skip_final_snapshot  = true

  tags = { Name = "Engine Alto DB", Environment = var.environment }
}

# ====== ElastiCache Redis ======
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.cluster_name}-redis"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.medium"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  tags = { Name = "Engine Alto Redis", Environment = var.environment }
}

# ====== Outputs ======
output "vpc_id" {
  value = aws_vpc.main.id
}

output "s3_models_bucket" {
  value = aws_s3_bucket.models.bucket
}

output "s3_assets_bucket" {
  value = aws_s3_bucket.assets.bucket
}

output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].address
}
