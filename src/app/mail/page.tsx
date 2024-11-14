import Mail from './mail';
/*import { Mail } from 'lucide-react';*/
import react from 'react';

const MailDashboard = () => {
  return(
   <Mail
    defaultLayout={[20,32,48]}
    defaultCollapsed={false}
    navCollapsedSize={4}
   />
  )
}

export default MailDashboard;