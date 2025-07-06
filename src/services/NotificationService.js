const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

class NotificationService {
  constructor() {
    // Configuration par défaut - peut être modifiée via les paramètres admin
    this.config = {
      email: {
        enabled: true,
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      },
      from: {
        name: process.env.LIBRARY_NAME || 'Bibliothèque',
        email: process.env.LIBRARY_EMAIL || 'noreply@bibliotheque.com'
      }
    };
    
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter(this.config.email);
      
      // Vérifier la connexion de manière asynchrone
      this.transporter.verify().then(() => {
        console.log('✅ Service de notification email configuré');
      }).catch((error) => {
        console.error('❌ Erreur configuration email:', error.message);
        this.transporter = null;
      });
    } catch (error) {
      console.error('❌ Erreur configuration email:', error.message);
      this.transporter = null;
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      console.log('🚫 Service email non configuré');
      return { error: true, message: 'Service email non configuré' };
    }

    try {
      const mailOptions = {
        from: `${this.config.from.name} <${this.config.from.email}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || this.htmlToText(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé:', result.messageId);
      return { error: false, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Erreur envoi email:', error.message);
      return { error: true, message: error.message };
    }
  }

  htmlToText(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  // Templates d'emails
  getLateReturnEmailTemplate(user, book, daysLate) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">📚 Livre en retard</h2>
        <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
        
        <p>Nous vous informons que le livre suivant est en retard de <strong>${daysLate} jour(s)</strong> :</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #343a40;">${book.titre}</h3>
          <p style="margin: 0; color: #6c757d;">
            Auteur: ${book.auteur}<br>
            ISBN: ${book.isbn}
          </p>
        </div>
        
        <p><strong>Merci de retourner ce livre dès que possible.</strong></p>
        
        <p style="color: #6c757d; font-size: 14px;">
          Des frais de retard peuvent s'appliquer selon le règlement de la bibliothèque.
        </p>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #6c757d;">
          Cet email a été envoyé automatiquement par le système de gestion de la bibliothèque.
        </p>
      </div>
    `;
    return html;
  }

  getReservationApprovedEmailTemplate(user, book, reservation) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">✅ Réservation validée</h2>
        <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
        
        <p>Excellente nouvelle ! Votre réservation a été validée :</p>
        
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin: 0 0 10px 0; color: #155724;">${book.titre}</h3>
          <p style="margin: 0; color: #155724;">
            Auteur: ${book.auteur}<br>
            ISBN: ${book.isbn}
          </p>
        </div>
        
        <p><strong>Le livre est maintenant disponible pour vous.</strong></p>
        <p>Vous pouvez venir le retirer à la bibliothèque dès maintenant.</p>
        
        <p style="color: #6c757d; font-size: 14px;">
          Date de réservation: ${new Date(reservation.date_reservation).toLocaleDateString('fr-FR')}
        </p>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #6c757d;">
          Cet email a été envoyé automatiquement par le système de gestion de la bibliothèque.
        </p>
      </div>
    `;
    return html;
  }

  // Méthodes principales pour l'envoi de notifications
  async notifyLateReturn(user, book, daysLate) {
    const subject = `📚 Livre en retard - ${book.titre}`;
    const html = this.getLateReturnEmailTemplate(user, book, daysLate);
    
    return await this.sendEmail(user.email, subject, html);
  }

  async notifyReservationApproved(user, book, reservation) {
    const subject = `✅ Réservation validée - ${book.titre}`;
    const html = this.getReservationApprovedEmailTemplate(user, book, reservation);
    
    return await this.sendEmail(user.email, subject, html);
  }

  // Test de configuration
  async testEmailConfiguration() {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const subject = 'Test de configuration - Système de notification';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">🔧 Test de configuration</h2>
        <p>Ceci est un email de test pour vérifier la configuration du système de notifications.</p>
        <p>Si vous recevez cet email, la configuration est correcte !</p>
        <p style="color: #6c757d; font-size: 14px;">
          Envoyé le: ${new Date().toLocaleString('fr-FR')}
        </p>
      </div>
    `;
    
    return await this.sendEmail(testEmail, subject, html);
  }
}

module.exports = new NotificationService();
