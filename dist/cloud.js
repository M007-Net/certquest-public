// Original introductory lessons, organized around the linked vendor study guides.
const CLOUD_REALMS=[
 {
  name:'The Amber Skyport',cert:'AWS Cloud Practitioner',code:'CLF-C02',role:'The Cloudweaver',icon:'☁',enemyArt:'storm-drake',
  desc:'Raise a city into the clouds. Discover AWS infrastructure, shared responsibility, core services, and costs.',
  spell:'Elastic Burst',effect:'Deal your knowledge damage plus 8 once per battle. The enemy can counterattack.',
  source:'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/',
  chapters:[
   ['Islands above the mist','Cloud concepts & global infrastructure','The Capacity Wisp',
    'Cloud computing lets you request technology resources when you need them instead of buying every server in advance. Elasticity means adding and removing capacity as demand changes; scalability is the ability to handle growth. An AWS Region is a geographic area with multiple Availability Zones. An Availability Zone consists of one or more discrete data centers with independent infrastructure. Spreading an application across zones can improve availability, but the application must be designed to use that redundancy.',[
     ['Traffic rises and falls each evening. Which idea describes adjusting capacity to match it?',['Archiving','Elasticity','Authentication','Encryption'],1,'Elasticity adjusts resources as demand changes, including scaling back down.'],
     ['What is an AWS Region?',['One user account','A single virtual machine','A geographic area containing multiple Availability Zones','A pricing discount'],2,'Regions are geographic areas; Availability Zones provide isolated infrastructure within them.'],
     ['What helps an application tolerate a single-zone outage?',['A design deployed across multiple Availability Zones','One larger server in the same zone','A longer password only','Removing backups'],0,'A multi-zone design can keep service available when one zone has problems.']
    ]],
   ['Keys to the skyport','Shared responsibility, IAM & core services','The Unbound Construct',
    'AWS secures the underlying cloud infrastructure; customers remain responsible for their data and access settings. The exact split depends on the service: with EC2 virtual machines, the customer normally manages the guest operating system and its patches. IAM policies and roles control access; grant only the permissions needed and protect sensitive accounts with MFA. Amazon EC2 provides virtual servers. Amazon S3 stores objects such as files and backups. Amazon RDS manages relational databases. AWS Lambda runs code without requiring you to provision or manage servers, but you still manage your code and configuration.',[
     ['Who normally patches the guest operating system on an Amazon EC2 instance?',['The customer','Only the internet provider','No one','The domain registrar'],0,'With EC2, the customer manages the guest OS; AWS manages the underlying infrastructure.'],
     ['Which AWS service is an object store for files and backups?',['Amazon RDS','Amazon EC2','AWS IAM','Amazon S3'],3,'S3 stores objects in buckets.'],
     ['An application needs temporary access to one AWS resource. What is the best principle?',['Share the root account','Grant broad access forever','Use a role with only the required permissions','Turn off authentication'],2,'Roles and least-privilege permissions reduce unnecessary access and avoid sharing root credentials.']
    ]],
   ['The skyport ledger','Billing, monitoring & service choice','The Runaway Colossus',
    'Cloud costs depend on the services, configuration, usage, and data transfer involved. AWS Pricing Calculator estimates planned workloads. Cost Explorer helps analyze spending and usage trends. AWS Budgets can notify you about thresholds; an alert alone is not an automatic spending cap. On-Demand compute suits flexible short-term use without a long commitment. Spot Instances can cost less but may be interrupted, so workloads must tolerate interruption. CloudWatch collects monitoring data such as metrics and logs, while CloudTrail records AWS account activity for auditing.',[
     ['Which tool estimates costs before deploying a planned AWS workload?',['CloudTrail','AWS Pricing Calculator','IAM','A security group'],1,'Pricing Calculator estimates cost from your planned configuration and usage assumptions.'],
     ['What should you assume about a basic budget alert?',['It always stops all resources','It guarantees a fixed bill','It provides a notification, not an automatic spending cap','It deletes unused accounts'],2,'Notifications help you respond; cost controls require appropriate configuration and action.'],
     ['Which workload is best suited to Spot Instances?',['A job that can checkpoint and tolerate interruption','A job that cannot ever stop','Any workload without planning','Only password storage'],0,'Spot capacity can be interrupted, so resilient, restartable workloads are a good fit.']
    ]]
  ]
 },
 {
  name:'The Azure Observatory',cert:'Azure Fundamentals',code:'AZ-900',role:'The Skywarden',icon:'◇',enemyArt:'forge-guardian',
  desc:'Restore the observatory’s protective wards. Learn cloud models, Azure services, identity, and governance.',
  spell:'Availability Ward',effect:'Absorb 24 incoming damage once per battle. Casting uses a turn.',
  source:'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900',
  chapters:[
   ['A foundation in the clouds','Cloud models & shared responsibility','The Drifting Sentinel',
    'A public cloud offers provider-operated resources to customers; a private cloud is dedicated to one organization. A hybrid cloud connects private or on-premises environments with public cloud services. Infrastructure as a service gives you infrastructure such as virtual machines while you manage the guest OS and applications. Platform as a service manages more of the platform so you can focus on your application. Software as a service delivers a ready-to-use application. Your responsibilities change with the service model, but you still need to protect identities, data, and access decisions.',[
     ['A company connects its on-premises environment with Azure. Which model is this?',['Public-only','Private-only','Offline computing','Hybrid cloud'],3,'Hybrid cloud combines environments, such as on-premises infrastructure and public cloud services.'],
     ['Which model normally leaves guest OS management with the customer?',['Software as a service','Infrastructure as a service','A fully managed email application','A hosted collaboration app'],1,'In IaaS, the provider operates infrastructure while the customer manages the guest OS and applications.'],
     ['Moving to SaaS means you can ignore which responsibility?',['Who can access your data','Protecting user identities','None of these responsibilities can simply be ignored','Appropriate data handling'],2,'Managed software does not remove your responsibility for identities, access, and appropriate data handling.']
    ]],
   ['Mapping the observatory','Azure architecture & services','The Resource Golem',
    'An Azure region is a geographic area with data centers. Availability zones are physically separate locations within supported regions. Resource groups organize related Azure resources within a subscription; management groups organize subscriptions. Azure Virtual Machines offer virtual servers, App Service hosts web applications on a managed platform, and Azure Functions runs event-driven code. Azure Blob Storage holds unstructured object data. Azure Virtual Network provides private network connectivity for Azure resources. Microsoft Entra ID supports identity and authentication; Azure RBAC controls which actions a principal can perform at a scope.',[
     ['Where can you organize resources that belong to one application?',['Only in a password manager','A DNS record','An Azure resource group','A browser bookmark'],2,'Resource groups organize related resources in an Azure subscription.'],
     ['Which Azure service stores unstructured objects such as images?',['Azure Blob Storage','Microsoft Entra ID','Azure Policy','Azure RBAC'],0,'Blob Storage is designed for unstructured object data.'],
     ['Which feature controls a user’s allowed actions on Azure resources at a scope?',['A storage tier','Azure RBAC','A display theme','An availability zone'],1,'Azure role-based access control assigns permissions at scopes such as a subscription or resource group.']
    ]],
   ['The observatory’s oath','Cost management, governance & monitoring','The Policy Titan',
    'The Azure pricing calculator estimates the cost of a proposed configuration. Cost Management helps analyze and monitor spending. Budgets can alert you, but a notification does not automatically stop every resource. Tags label resources for organization and cost analysis. Azure Policy evaluates resource configurations against rules and can enforce requirements, such as allowed locations. A resource lock can help prevent accidental deletion; it does not replace permissions. Azure Monitor collects telemetry such as metrics and logs. Azure Service Health provides personalized information about service issues and maintenance that may affect your resources.',[
     ['Which Azure feature can enforce allowed deployment locations?',['A resource name','A billing email','A virtual machine size','Azure Policy'],3,'Policy evaluates resource configuration and can enforce governance requirements.'],
     ['What is the main purpose of a resource lock?',['Grant every user ownership','Make a backup','Help prevent accidental deletion or modification, depending on lock type','Encrypt network traffic'],2,'Locks add protection against unintended changes; they are not backups or substitutes for RBAC.'],
     ['Where would you look for Azure metrics and logs?', ['Azure Monitor','A pricing calculator','A resource tag only','An invoice PDF'],0,'Azure Monitor gathers and helps analyze telemetry from your environment.']
    ]]
  ]
 }
];

const CLOUD_ITEMS=[
 ['cloud-spark','3-0','Cloud Spark','charm',2],['storm-crystal','3-1','Storm Crystal','charm',4],['sky-core','3-2','Sky Core','charm',6],
 ['mist-shield','4-0','Mist Shield','shield',1],['azure-shield','4-1','Azure Shield','shield',2],['skyward-aegis','4-2','Skyward Aegis','shield',3]
].map(([id,quest,name,slot,power])=>({id,quest,name,slot,rarity:quest.endsWith('-2')?'Rare':'Uncommon',attack:0,guard:slot==='shield'?power:0,knowledge:slot==='charm'?power:0,story:slot==='charm'?'AWS cloud mastery strengthens your knowledge spells. This charm works in every realm.':'Azure governance and resilience reinforce your defenses. This shield stacks with your A+ armor.'}));

const CLOUD_EXAMS={
 3:[
  ['A shop needs more compute during a sale and less afterward. Which cloud benefit fits?', ['Permanent maximum capacity','Elasticity','Manual password rotation','Offline storage'],1,'Elasticity adjusts capacity with demand.'],
  ['A team deploys redundant app instances in two Availability Zones. What is its main goal?',['Cheaper passwords','Eliminating every failure','Avoiding all usage charges','Improving availability during a zone failure'],3,'Independent zones can reduce the impact of a zone outage when the application is designed for failover.'],
  ['A team chooses a geographic location for an AWS deployment. What is it selecting?',['A Region','An IAM role','A budget alert','An S3 object key'],0,'A Region is a geographic area containing multiple Availability Zones.'],
  ['A security update is needed inside an EC2 instance’s guest OS. Who normally applies it?',['The DNS provider','The payment processor','The customer','Nobody'],2,'The customer manages the guest OS under the EC2 shared responsibility model.'],
  ['An app must retrieve files without storing a shared root password. Which access design is best?',['Put root credentials in code','Use an appropriate least-privilege role','Make every bucket public','Disable account logs'],1,'Roles provide a way to grant limited access without sharing root credentials.'],
  ['A team needs a managed relational database. Which service is the closest fit?',['Amazon S3','AWS IAM','AWS Budgets','Amazon RDS'],3,'RDS manages relational database services.'],
  ['Which service can run code without the customer provisioning servers?',['AWS Lambda','AWS Pricing Calculator','CloudTrail','Cost Explorer'],0,'Lambda manages the server infrastructure for code execution; customers still manage their code and configuration.'],
  ['A team needs to retain uploaded photos as objects. Which service fits?',['Amazon EC2 alone','Amazon RDS tables only','Amazon S3','IAM policies'],2,'S3 is an object storage service.'],
  ['Which tool helps estimate a new workload’s bill before launch?',['CloudWatch alarms','AWS Pricing Calculator','CloudTrail events','A subnet'],1,'Estimates depend on planned services, configuration, and usage assumptions.'],
  ['A budget notification arrives. What should the team avoid assuming?',['The alert needs review','Usage contributes to costs','They can investigate costs','All spending has automatically stopped'],3,'An alert alone does not cap spending.'],
  ['A restartable batch job can checkpoint its work. Which purchase option may suit it?',['Spot Instances','Only dedicated servers forever','Only maximum-sized machines','No compute'],0,'Spot Instances suit work that can tolerate interruption.'],
  ['Investigators want AWS account activity for an audit. Which service fits?',['Pricing Calculator','S3 storage tiers','CloudTrail','Cost Explorer'],2,'CloudTrail records account activity; CloudWatch focuses on monitoring data such as metrics and logs.']
 ],
 4:[
  ['A firm connects its own data center to Azure. What deployment model does that illustrate?',['Private-only','Hybrid','Offline','SaaS-only'],1,'Hybrid cloud connects distinct environments such as on-premises infrastructure and public cloud.'],
  ['An IaaS VM needs a guest OS update. Who normally manages it?',['The customer','The registrar','Nobody','Every other tenant'],0,'IaaS leaves the guest operating system and applications with the customer.'],
  ['A team wants a managed web hosting platform rather than managing a VM’s OS. Which service fits?',['A resource lock','A storage tag','A budget alert','Azure App Service'],3,'App Service provides managed application hosting.'],
  ['Which statement about SaaS security is correct?',['The provider chooses every user’s permissions','Data governance disappears','Customers still manage appropriate identities and access','Passwords should be shared'],2,'SaaS reduces infrastructure work, but identity and access responsibilities remain.'],
  ['Which container organizes related Azure resources within a subscription?',['Resource group','Availability zone','DNS label','Browser window'],0,'Resource groups organize related resources.'],
  ['A company organizes several Azure subscriptions under one governance hierarchy. What can it use?',['A Blob object','A network cable','A VM snapshot','Management groups'],3,'Management groups provide a hierarchy above subscriptions.'],
  ['Where should an app store large unstructured image objects?',['Azure RBAC','Azure Blob Storage','Azure Policy','Microsoft Entra ID'],1,'Blob Storage holds unstructured object data.'],
  ['A user needs permission to manage only one resource group. What should be scoped appropriately?',['The monitor brightness','The billing currency','An Azure RBAC role assignment','A public announcement'],2,'RBAC assigns permissions at a scope, supporting least privilege.'],
  ['A governance team wants to restrict the regions used for new deployments. Which feature fits?',['Azure Policy','Azure Monitor metrics alone','A desktop shortcut','A password hint'],0,'Policy can enforce configuration requirements such as allowed locations.'],
  ['Which feature adds protection against accidentally deleting a critical resource?',['A cheaper VM','A resource lock','A different invoice address','A storage name'],1,'A delete lock can prevent unintended deletion, subject to authorized lock management.'],
  ['An Azure budget alert fires. What does that alone guarantee?',['Every VM shuts down','A refund','All future spending is impossible','A notification, not a universal spending stop'],3,'Budget notifications require follow-up or configured automation.'],
  ['A team needs service-incident information specific to its Azure resources. Where should it look?',['A resource tag','A local text editor','Azure Service Health','A pricing estimate'],2,'Service Health provides personalized information about relevant service issues and maintenance.']
 ]
};
